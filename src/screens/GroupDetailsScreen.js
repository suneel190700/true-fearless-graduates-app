// src/screens/GroupDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const getGroupQuery = `
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
      id
      title
      description
      created_by
      tags
      members {
        items {
          id
          userID
          role
          user {
            id
            full_name
            email
          }
        }
      }
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

const deleteMemberMutation = `
  mutation DeleteGroupMember($input: DeleteGroupMemberInput!) {
    deleteGroupMember(input: $input) {
      id
    }
  }
`;

const deleteGroupMutation = `
  mutation DeleteGroup($input: DeleteGroupInput!) {
    deleteGroup(input: $input) {
      id
    }
  }
`;

function GroupDetailsScreen({ navigateTo, route }) {
  const groupId = route?.params?.groupId;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  const client = generateClient();

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        await fetchGroupDetails();
      } catch (e) {
        console.error('[GroupDetails] Auth error:', e);
        setError('Failed to load group. Please re-login.');
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroupDetails = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const res = await client.graphql({
        query: getGroupQuery,
        variables: { id: groupId },
      });
      const g = res?.data?.getGroup;
      console.log('[GroupDetails] group:', g);
      setGroup(g);
    } catch (e) {
      console.error('[GroupDetails] Error loading group', e);
      setError('Unable to load group details.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!currentUser) {
      alert('Please log in first.');
      return;
    }

    try {
      await client.graphql({
        query: createMemberMutation,
        variables: {
          input: {
            groupID: groupId,
            userID: currentUser.userId,
            role: 'member',
          },
        },
      });

      alert('Joined successfully!');
      await fetchGroupDetails();
    } catch (e) {
      console.error('[GroupDetails] Join Error:', e);
      alert(
        'Error joining group: ' + (e?.errors?.[0]?.message || e.message)
      );
    }
  };

  const handleLeave = async () => {
    if (!currentUser) return;
    if (!window.confirm('Leave this group?')) return;

    try {
      const membership = group.members?.items?.find(
        (m) => m.userID === currentUser.userId
      );
      if (!membership) {
        alert('You are not a member of this group.');
        return;
      }

      await client.graphql({
        query: deleteMemberMutation,
        variables: { input: { id: membership.id } },
      });

      alert('Left group.');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('[GroupDetails] Leave Error:', e);
      alert('Error leaving group.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this group permanently?')) return;
    try {
      await client.graphql({
        query: deleteGroupMutation,
        variables: { input: { id: groupId } },
      });
      navigateTo('Dashboard');
    } catch (e) {
      console.error('[GroupDetails] Delete Error:', e);
      alert('Error deleting group.');
    }
  };

  if (loading) {
    return (
      <p style={{ textAlign: 'center', marginTop: '50px' }}>
        Loading group…
      </p>
    );
  }
  if (!group) {
    return (
      <p style={{ textAlign: 'center', marginTop: '50px' }}>
        Group not found.
      </p>
    );
  }

  const isMember = group.members?.items?.some(
    (m) => m.userID === currentUser?.userId
  );
  const isCreator = group.created_by === currentUser?.userId;

  const getRoleLabel = (member) => {
    if (member.role) return member.role;
    if (member.userID === group.created_by) return 'owner';
    return 'member';
  };

  const tags = group.tags || [];

  return (
    <div className="form-container" style={{ maxWidth: 800, textAlign: 'left' }}>
      <button
        type="button"
        onClick={() => navigateTo('Dashboard')}
        className="btn"
        style={{ marginBottom: 20, background: '#f3f4f6' }}
      >
        ← Back
      </button>

      <h1
        style={{
          borderBottom: '2px solid var(--primary)',
          paddingBottom: 8,
          marginBottom: 8,
        }}
      >
        {group.title}
      </h1>

      {tags.length > 0 && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tags.map((t, idx) => (
            <span
              key={`${t}-${idx}`}
              style={{
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: '0.78rem',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #dbeafe',
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <p style={{ fontSize: '1.0rem', marginBottom: 16 }}>
        {group.description || 'No description provided.'}
      </p>

      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
          {error}
        </p>
      )}

      {/* Members */}
      <div className="card" style={{ marginTop: 10 }}>
        <h3 style={{ marginTop: 0 }}>Members ({group.members?.items?.length || 0})</h3>
        <ul
          style={{
            listStyle: 'none',
            paddingLeft: 0,
            marginTop: 8,
          }}
        >
          {group.members?.items?.length === 0 && (
            <li style={{ color: '#888' }}>
              No members yet. Be the first to join!
            </li>
          )}

          {group.members?.items?.map((m) => {
            const label = getRoleLabel(m);
            return (
              <li
                key={m.id}
                style={{
                  padding: '6px 0',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  {m.user ? m.user.full_name || m.user.email : 'Unknown user'}
                  {m.user?.email && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      ({m.user.email})
                    </span>
                  )}
                </div>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: '0.75rem',
                    textTransform: 'capitalize',
                    background:
                      label === 'owner' ? '#eef2ff' : '#f9fafb',
                    color:
                      label === 'owner' ? '#4f46e5' : '#6b7280',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        {isMember ? (
          <>
            <button
              className="btn"
              style={{
                marginRight: 10,
                background: '#eff6ff',
                color: '#1d4ed8',
              }}
              onClick={() => navigateTo('GroupChat', { groupId, title: group.title })}
            >
              💬 Chat
            </button>
            <button
              className="btn"
              style={{
                marginRight: 10,
                background: '#0ea5e9',
                color: 'white',
              }}
              onClick={() => navigateTo('GroupTasks', { groupId, title: group.title })}
            >
              ✅ Tasks
            </button>
            {!isCreator && (
              <button
                onClick={handleLeave}
                className="btn"
                style={{ background: '#fee2e2', color: '#b91c1c' }}
              >
                Leave group
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleJoin}
            className="btn btn-primary"
          >
            Join this group
          </button>
        )}

        {isCreator && (
          <div
            style={{
              marginTop: 24,
              borderTop: '1px solid #e5e7eb',
              paddingTop: 14,
            }}
          >
            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Owner actions
            </p>
            <button
              onClick={handleDelete}
              className="btn"
              style={{ background: '#fee2e2', color: '#b91c1c' }}
            >
              Delete group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetailsScreen;
