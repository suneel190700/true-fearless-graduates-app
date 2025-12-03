// src/screens/CompleteProfileScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';

/* ================================
   QUERIES & MUTATIONS
================================ */

const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      full_name
      role
      skills
      interests
      availability_hours
      profilePic
    }
  }
`;

const updateUserMutation = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      email
      full_name
      role
      skills
      interests
      availability_hours
      profilePic
    }
  }
`;

/* ================================
   COMPONENT
================================ */

function CompleteProfileScreen({ navigateTo }) {
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [availabilityHours, setAvailabilityHours] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');

  const client = generateClient();

  /* Helpers */

  const normalizeToString = (val) => {
    if (!val) return '';
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string') return val;
    return '';
  };

  const normalizeToArray = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val.length ? val : null;

    if (typeof val === 'string') {
      const arr = val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return arr.length ? arr : null;
    }

    return null;
  };

  /* Load existing profile */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadError('');
        const { userId } = await getCurrentUser();
        console.log('[CompleteProfile] current userId:', userId);

        const result = await client.graphql({
          query: getUserQuery,
          variables: { id: userId },
        });

        console.log('[CompleteProfile] getUser result:', result);

        const user = result?.data?.getUser;
        if (!user) {
          console.warn(
            '[CompleteProfile] No User record found for this id. Make sure createUser ran at signup.'
          );
          return;
        }

        setSkills(normalizeToString(user.skills));
        setInterests(normalizeToString(user.interests));
        setAvailabilityHours(
          user.availability_hours != null ? String(user.availability_hours) : ''
        );
      } catch (e) {
        console.error('[CompleteProfile] Error loading profile:', e);
        setLoadError('Failed to load your profile. You can still try saving changes.');
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setLoading(true);

    try {
      const { userId } = await getCurrentUser();
      console.log('[CompleteProfile] saving for userId:', userId);

      let profilePicPath = null;

      if (file) {
        const path = `public/avatars/${userId}-${Date.now()}.png`;
        const uploadResult = await uploadData({
          path,
          data: file,
        }).result;

        profilePicPath = uploadResult.path;
        console.log('[CompleteProfile] uploaded profile pic path:', profilePicPath);
      }

      const skillsArray = normalizeToArray(skills);
      const interestsArray = normalizeToArray(interests);

      const input = { id: userId };

      if (skillsArray) input.skills = skillsArray;
      if (interestsArray) input.interests = interestsArray;

      if (availabilityHours !== '') {
        const parsed = parseInt(availabilityHours, 10);
        if (!Number.isNaN(parsed)) {
          input.availability_hours = parsed;
        }
      }

      if (profilePicPath) {
        input.profilePic = profilePicPath;
      }

      console.log('[CompleteProfile] updateUser input:', input);

      const updateResult = await client.graphql({
        query: updateUserMutation,
        variables: { input },
      });

      console.log('[CompleteProfile] updateUser result:', updateResult);

      alert('Profile updated successfully!');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('[CompleteProfile] SAVE ERROR →', JSON.stringify(e, null, 2));
      setSaveError(e?.errors?.[0]?.message || e.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Edit Profile</div>
          <div className="page-subtitle">
            Tell others what you’re good at and how much time you can contribute each week.
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            style={{ background: '#f3f4f6', color: '#111827' }}
            onClick={() => navigateTo('Dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-header" style={{ marginBottom: 10 }}>
            <div>
              <div className="card-title">Profile details</div>
              <div className="card-subtitle">
                Skills, interests, and availability help us match you to the right groups.
              </div>
            </div>
          </div>

          {loadError && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 8 }}>
              {loadError}
            </p>
          )}

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontWeight: 500 }}>Profile picture</label>
              <div style={{ marginTop: 6 }}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <p className="text-muted" style={{ marginTop: 4 }}>
                PNG or JPG, square works best.
              </p>
            </div>

            <label style={{ fontWeight: 500 }}>Skills</label>
            <input
              type="text"
              className="input-field"
              placeholder="React, Node, Data Analysis"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <p className="text-muted" style={{ marginTop: -12, marginBottom: 10 }}>
              Separate multiple skills with commas.
            </p>

            <label style={{ fontWeight: 500 }}>Interests</label>
            <input
              type="text"
              className="input-field"
              placeholder="AI, Hackathons, Open Source"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
            <p className="text-muted" style={{ marginTop: -12, marginBottom: 10 }}>
              What topics excite you? Use commas to add multiple.
            </p>

            <label style={{ fontWeight: 500 }}>Weekly availability (hours)</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 5"
              value={availabilityHours}
              onChange={(e) => setAvailabilityHours(e.target.value)}
              min="0"
            />

            {saveError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                {saveError}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 10 }}
              disabled={loading}
            >
              {loading ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfileScreen;
