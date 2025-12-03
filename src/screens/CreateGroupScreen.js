// src/screens/CreateGroupScreen.js
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

// 1. Mutation to create the Group
const createGroupMutation = `
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      title
      created_by
    }
  }
`;

// 2. Mutation to add the creator as a Member (Link Table)
const createMemberMutation = `
  mutation CreateMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) {
      id
    }
  }
`;

function CreateGroupScreen({ navigateTo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const client = generateClient();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a project title.');
      return;
    }

    setLoading(true);
    try {
      // Get current user ID
      const currentUser = await getCurrentUser();
      const userId = currentUser.userId;

      // 1) Create the group
      const groupRes = await client.graphql({
        query: createGroupMutation,
        variables: {
          input: {
            title: title.trim(),
            description: description.trim() || null,
            created_by: userId,
          },
        },
      });

      const newGroup = groupRes?.data?.createGroup;
      const newGroupId = newGroup?.id;
      console.log('Group Created:', newGroup);

      if (!newGroupId) {
        alert('Group was not created correctly.');
        return;
      }

      // 2) Add the creator as a member with role "owner"
      await client.graphql({
        query: createMemberMutation,
        variables: {
          input: {
            groupID: newGroupId,
            userID: userId,
            role: 'owner', // NEW
          },
        },
      });

      alert('Group created successfully!');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('Error creating group:', e);
      alert('Failed to create group. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: '500px' }}>
      <h2>Start New Project</h2>
      <p>Launch a new initiative.</p>

      <form onSubmit={handleCreate}>
        <label>Project Title</label>
        <input
          type="text"
          placeholder="e.g., AI Research"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
        />

        <label>Description</label>
        <textarea
          placeholder="Describe the goals..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          className="input-field"
        />

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>

        <button
          type="button"
          onClick={() => navigateTo('Dashboard')}
          className="btn"
          style={{
            width: '100%',
            marginTop: '10px',
            backgroundColor: '#e0e0e0',
            color: 'black',
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CreateGroupScreen;
