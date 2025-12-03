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
      description
      created_by
      createdAt
    }
  }
`;

// 2. Mutation to add the creator as a GroupMember
const createGroupMemberMutation = `
  mutation CreateGroupMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) {
      id
      groupID
      userID
    }
  }
`;

function CreateGroupScreen({ navigateTo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const client = generateClient();

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide a group title.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { userId } = await getCurrentUser();
      console.log('[CreateGroup] current userId:', userId);

      // 1) Create the Group with created_by = current user
      const groupResult = await client.graphql({
        query: createGroupMutation,
        variables: {
          input: {
            title: title.trim(),
            description: description.trim() || null,
            created_by: userId,
          },
        },
      });

      const createdGroup = groupResult?.data?.createGroup;
      console.log('[CreateGroup] created group:', createdGroup);

      if (!createdGroup?.id) {
        throw new Error('Failed to create group.');
      }

      const groupId = createdGroup.id;

      // 2) Add the creator as a member in GroupMember table
      await client.graphql({
        query: createGroupMemberMutation,
        variables: {
          input: {
            groupID: groupId,
            userID: userId,
          },
        },
      });

      alert('Group created successfully!');
      navigateTo('GroupDetails', { groupId });
    } catch (e) {
      console.error('[CreateGroup] Error creating group:', e);
      setError(e?.errors?.[0]?.message || e.message || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Create new project space</div>
          <div className="page-subtitle">
            Set up a collaboration space for your team, class, or study group.
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

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <div>
            <div className="card-title">Project details</div>
            <div className="card-subtitle">
              Give your group a clear, short name and a helpful description.
            </div>
          </div>
        </div>

        <form onSubmit={handleCreate}>
          <label style={{ fontWeight: 500 }}>Project name</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. AI Study Circle, Web Dev Capstone Team"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label style={{ fontWeight: 500 }}>Description</label>
          <textarea
            className="input-field"
            style={{ minHeight: 80, resize: 'vertical' }}
            placeholder="What is this group for? What kind of work will you do together?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 10 }}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Group'}
          </button>

          <button
            type="button"
            onClick={() => navigateTo('Dashboard')}
            className="btn"
            style={{
              width: '100%',
              marginTop: 8,
              backgroundColor: '#e5e7eb',
              color: '#111827',
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupScreen;
