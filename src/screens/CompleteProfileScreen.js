// src/screens/CompleteProfileScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage'; // For profile picture upload

// Fetch minimal user profile
const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      skills
      interests
      availability_hours
      profilePic
    }
  }
`;

// Update user profile
const updateUserMutation = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      profilePic
    }
  }
`;

// Helper to compute profile completeness based on the fields we control here
function computeProfileCompleteness({ skills, interests, availabilityHours, profilePic }) {
  let total = 4;
  let score = 0;

  const hasSkills = Array.isArray(skills)
    ? skills.length > 0
    : typeof skills === 'string' && skills.trim().length > 0;

  const hasInterests = Array.isArray(interests)
    ? interests.length > 0
    : typeof interests === 'string' && interests.trim().length > 0;

  const hoursNum = parseInt(availabilityHours, 10);
  const hasAvailability = !isNaN(hoursNum) && hoursNum > 0;

  const hasPic = !!profilePic;

  if (hasSkills) score++;
  if (hasInterests) score++;
  if (hasAvailability) score++;
  if (hasPic) score++;

  return Math.round((score / total) * 100);
}

function CompleteProfileScreen({ navigateTo }) {
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [availabilityHours, setAvailabilityHours] = useState('');
  const [file, setFile] = useState(null); // Selected file for upload
  const [profilePic, setProfilePic] = useState(null); // Existing pic path from DB

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const client = generateClient();

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoadError('');
      const { userId } = await getCurrentUser();
      const result = await client.graphql({
        query: getUserQuery,
        variables: { id: userId },
      });

      const data = result?.data?.getUser;
      if (data) {
        if (data.skills) setSkills(data.skills.join(', '));
        if (data.interests) setInterests(data.interests.join(', '));
        if (data.availability_hours != null) {
          setAvailabilityHours(String(data.availability_hours));
        }
        if (data.profilePic) setProfilePic(data.profilePic);
      }
    } catch (e) {
      console.error('[CompleteProfile] loadProfile error:', e);
      setLoadError('Failed to load your profile. You can still fill it in and save.');
    }
  };

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveError('');
    try {
      const { userId } = await getCurrentUser();
      let profilePicPath = profilePic || null; // start with existing path

      // 1. If a new file is selected, upload it and get its path
      if (file) {
        const path = `public/avatars/${userId}-${Date.now()}.png`;

        const result = await uploadData({
          path: path,
          data: file,
        }).result;

        profilePicPath = result.path;
      }

      // 2. Prepare input data
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      const interestsArray = interests
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i);

      const input = {
        id: userId,
        skills: skillsArray,
        interests: interestsArray,
        availability_hours: parseInt(availabilityHours, 10) || 0,
      };

      if (profilePicPath) {
        input.profilePic = profilePicPath;
      }

      // 3. Save via updateUser
      await client.graphql({
        query: updateUserMutation,
        variables: { input },
      });

      alert('Profile updated successfully!');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('[CompleteProfile] Save Error →', e);
      const msg =
        e?.errors?.[0]?.message || e.message || 'Failed to save profile.';
      setSaveError(msg);
      alert('Failed to save: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  // Compute completeness dynamically from the current form state
  const completion = computeProfileCompleteness({
    skills,
    interests,
    availabilityHours,
    profilePic,
  });

  let completionLabel = '';
  if (completion < 50) {
    completionLabel = 'Let’s get the basics in place.';
  } else if (completion < 100) {
    completionLabel = 'Looking good! A few more details to reach 100%.';
  } else {
    completionLabel = 'Nice! Your profile is complete and match-ready.';
  }

  return (
    <div className="form-container" style={{ maxWidth: '500px' }}>
      <button
        type="button"
        className="btn"
        style={{ marginBottom: 10, background: '#f3f4f6', color: '#111827' }}
        onClick={() => navigateTo('Dashboard')}
      >
        ← Back
      </button>

      <h2>Edit Profile</h2>

      {/* Profile completeness bar */}
      <div
        style={{
          marginTop: 10,
          marginBottom: 20,
          padding: '10px 12px',
          borderRadius: 12,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <span>Profile completeness</span>
          <span>{completion}%</span>
        </div>
        <div
          style={{
            width: '100%',
            height: 8,
            borderRadius: 999,
            background: '#e5e7eb',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${completion}%`,
              height: '100%',
              background:
                completion === 100 ? '#16a34a' : 'var(--primary, #2563eb)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          {completionLabel}
        </div>
      </div>

      {loadError && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
          {loadError}
        </p>
      )}

      {/* Profile picture */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '10px',
            fontWeight: 'bold',
          }}
        >
          Profile Picture
        </label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {profilePic && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginTop: 6,
            }}
          >
            Existing picture saved. Uploading a new one will replace it.
          </p>
        )}
      </div>

      {/* Skills */}
      <label>Skills (Comma separated)</label>
      <input
        type="text"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        className="input-field"
        placeholder="React, Node, Design"
      />

      {/* Interests */}
      <label>Interests (Comma separated)</label>
      <input
        type="text"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        className="input-field"
        placeholder="AI, Gaming"
      />

      {/* Availability */}
      <label>Weekly Availability (Hours)</label>
      <input
        type="number"
        value={availabilityHours}
        onChange={(e) => setAvailabilityHours(e.target.value)}
        className="input-field"
      />

      {saveError && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 8 }}>
          {saveError}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '15px' }}
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
      <button
        onClick={() => navigateTo('Dashboard')}
        className="btn"
        style={{
          width: '100%',
          marginTop: '10px',
          background: '#eee',
          color: 'black',
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default CompleteProfileScreen;
