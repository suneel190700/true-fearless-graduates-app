import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';

/* ================================
   QUERIES & MUTATIONS
================================ */

// Find user by email (NOT by id)
const findUserByEmailQuery = `
  query ListUsersByEmail($email: String!) {
    listUsers(filter: { email: { eq: $email } }) {
      items {
        id
        email
        full_name
        role
        skills
        interests
        availability_hours
        profilePic
        createdAt
        updatedAt
        __typename
      }
    }
  }
`;

const createUserMutation = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      full_name
      role
      skills
      interests
      availability_hours
      profilePic
      createdAt
      updatedAt
      __typename
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
      createdAt
      updatedAt
      __typename
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

  // This is the REAL User table id in DynamoDB
  const [userDbId, setUserDbId] = useState(null);
  const [userEmail, setUserEmail] = useState('');

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
     LOAD USER PROFILE (BY EMAIL)
  ================================= */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const current = await getCurrentUser();

        // In your logs: username is the email
        const email =
          current?.signInDetails?.loginId || current?.username;

        setUserEmail(email);

        // Look up User row by email
        const result = await client.graphql({
          query: findUserByEmailQuery,
          variables: { email },
        });

        const items = result.data?.listUsers?.items || [];

        if (items.length > 0) {
          const user = items[0];
          setUserDbId(user.id);

          setSkills(normalizeToString(user.skills));
          setInterests(normalizeToString(user.interests));
          setAvailabilityHours(user.availability_hours || '');
        } else {
          // No user row yet in DynamoDB; fields stay empty
          console.log('No User record yet for email:', email);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    };

    loadProfile();
  }, [client]);

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
      // This is the logged-in Cognito user, but we ONLY care about the email here
      const current = await getCurrentUser();
      const email =
        current?.signInDetails?.loginId || current?.username;
      if (!userEmail) setUserEmail(email);

      // Upload image if selected
      let profilePicPath = null;
      if (file) {
        const path = `public/avatars/${email}-${Date.now()}.png`;
        const result = await uploadData({
          path,
          data: file,
        }).result;

        profilePicPath = result.path;
      }

      const skillsArray = normalizeToArray(skills);
      const interestsArray = normalizeToArray(interests);

      // If we already know the userDbId → updateUser
      if (userDbId) {
        const input = { id: userDbId };

        if (skillsArray) input.skills = skillsArray;
        if (interestsArray) input.interests = interestsArray;
        if (availabilityHours !== '') {
          input.availability_hours = Number(availabilityHours);
        }
        if (profilePicPath) input.profilePic = profilePicPath;

        await client.graphql({
          query: updateUserMutation,
          variables: { input },
        });
      } else {
        // No User row yet → create one, then effectively "upsert"
        const createInput = {
          email,
          // Optional fields
          full_name: null,
          role: 'student',
        };

        // Put profile fields into create as well
        if (skillsArray) createInput.skills = skillsArray;
        if (interestsArray) createInput.interests = interestsArray;
        if (availabilityHours !== '') {
          createInput.availability_hours = Number(availabilityHours);
        }
        if (profilePicPath) createInput.profilePic = profilePicPath;

        const createResult = await client.graphql({
          query: createUserMutation,
          variables: { input: createInput },
        });

        const created = createResult.data?.createUser;
        if (created?.id) {
          setUserDbId(created.id);
        }
      }

      alert('Profile updated successfully!');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('SAVE ERROR →', JSON.stringify(e, null, 2));
      alert(
        'Failed to save: ' +
          (e?.errors?.[0]?.message || e.message)
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
