// src/screens/CreateGroupScreen.js
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const createGroupMutation = `
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      title
      description
      created_by
      tags
    }
  }
`;

const createMemberMutation = `
  mutation CreateGroupMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) {
      id
    }
  }
`;

function CreateGroupScreen({ navigateTo }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState(''); // comma-separated
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const client = generateClient();

  const parseTags = (raw) => {
    if (!raw) return [];
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a project title.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser.userId;

      const tags = parseTags(tagsInput);

      // 1) Create the group with tags + created_by
      const groupRes = await client.graphql({
        query: createGroupMutation,
        variables: {
          input: {
            title: title.trim(),
            description: description.trim() || null,
            created_by: userId,
            tags: tags.length ? tags : null,
          },
        },
      });

      const newGroup = groupRes?.data?.createGroup;
      const newGroupId = newGroup?.id;

      console.log('[CreateGroup] created group:', newGroup);

      if (!newGroupId) {
        setError('Group was not created correctly.');
        return;
      }

      // 2) Add the creator as an "owner" member
      await client.graphql({
        query: createMemberMutation,
        variables: {
          input: {
            groupID: newGroupId,
            userID: userId,
            role: 'owner',
          },
        },
      });

      alert('Group created successfully!');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('[CreateGroup] Error:', e);
      setError(
        e?.errors?.[0]?.message || e.message || 'Failed to create group.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: 520, textAlign: 'left' }}>
      <button
        type="button"
        className="btn"
        style={{ marginBottom: 16, background: '#f3f4f6' }}
        onClick={() => navigateTo('Dashboard')}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: 4 }}>Start a new project</h2>
      <p className="text-muted" style={{ marginBottom: 18 }}>
        Create a collaboration space for your team or study group.
      </p>

      <form onSubmit={handleCreate}>
        <label>Project title</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. AI Study Group"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Description</label>
        <textarea
          className="input-field"
          placeholder="What is this group about? Goals, topics, etc."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Tags (comma separated)</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. AI, Web Dev, Beginner-friendly"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
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
          {loading ? 'Creating…' : 'Create group'}
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
  );
}

export default CreateGroupScreen;
