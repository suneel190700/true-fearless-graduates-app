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

  const client = generateClient();

  /* ================================
     HELPERS
  ================================= */

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

  /* ================================
     LOAD USER PROFILE (BY id = userId)
  ================================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { userId } = await getCurrentUser();
        console.log('CompleteProfileScreen: current userId:', userId);

        const result = await client.graphql({
          query: getUserQuery,
          variables: { id: userId },
        });

        console.log('CompleteProfileScreen: getUser result:', result);

        const data = result?.data?.getUser;

        if (data) {
          setSkills(normalizeToString(data.skills));
          setInterests(normalizeToString(data.interests));
          setAvailabilityHours(data.availability_hours ?? '');
        } else {
          console.warn(
            'CompleteProfileScreen: No User record found for this id. Did you createUser with id = userId at signup?'
          );
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================
     FILE SELECT
  ================================= */

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) setFile(selected);
  };

  /* ================================
     SAVE PROFILE
  ================================= */

  const handleSave = async () => {
    setLoading(true);

    try {
      const { userId } = await getCurrentUser();
      console.log('CompleteProfileScreen: saving for userId:', userId);

      let profilePicPath = null;

      // Upload image if selected
      if (file) {
        const path = `public/avatars/${userId}-${Date.now()}.png`;
        const uploadResult = await uploadData({
          path,
          data: file,
        }).result;

        profilePicPath = uploadResult.path;
        console.log('CompleteProfileScreen: uploaded profile pic path:', profilePicPath);
      }

      const skillsArray = normalizeToArray(skills);
      const interestsArray = normalizeToArray(interests);

      const input = { id: userId };

      if (skillsArray) input.skills = skillsArray;
      if (interestsArray) input.interests = interestsArray;

      if (availabilityHours !== '') {
        const hoursNum = parseInt(availabilityHours, 10);
        if (!Number.isNaN(hoursNum)) {
          input.availability_hours = hoursNum;
        }
      }

      if (profilePicPath) {
        input.profilePic = profilePicPath;
      }

      console.log('CompleteProfileScreen: updateUser input:', input);

      const updateResult = await client.graphql({
        query: updateUserMutation,
        variables: { input },
      });

      console.log('CompleteProfileScreen: updateUser result:', updateResult);

      alert('Profile updated successfully!');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('SAVE ERROR →', JSON.stringify(e, null, 2));
      alert(
        'Failed to save: ' + (e?.errors?.[0]?.message || e.message)
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UI RENDER
  ================================= */

  return (
    <div className="form-container" style={{ maxWidth: '500px' }}>
      <h2>Edit Profile</h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <label>Skills (Comma separated)</label>
      <input
        type="text"
        className="input-field"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        placeholder="React, Node"
      />

      <label>Interests (Comma separated)</label>
      <input
        type="text"
        className="input-field"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        placeholder="AI, Gaming"
      />

      <label>Weekly Availability (Hours)</label>
      <input
        type="number"
        className="input-field"
        value={availabilityHours}
        onChange={(e) => setAvailabilityHours(e.target.value)}
      />

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
