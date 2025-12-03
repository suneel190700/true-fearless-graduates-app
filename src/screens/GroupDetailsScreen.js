// src/screens/GroupDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

/* ================================
   QUERIES & MUTATIONS
================================ */

const getGroupQuery = `
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
      id
      title
      description
      created_by
      createdAt
      members {
        items {
          id
          userID
          user {
            id
            full_name
            email
          }
        }
      }
      tasks {
        items {
          id
          status
        }
      }
    }
  }
`;

const createMemberMutation = `
  mutation CreateMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) {
      id
      groupID
      userID
    }
  }
`;

const deleteMemberMutation = `
  mutation DeleteMember($input: DeleteGroupMemberInput!) {
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

/* ================================
   COMPONENT
================================ */

function GroupDetailsScreen({ navigateTo, route }) {
  const groupId = route?.params?.groupId;
  const [group, setGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const client = generateClient();

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        console.log('[GroupDetails] currentUser:', user);
        setCurrentUser(user);
        await fetchGroupDetails();
      } catch (e) {
        console.error('[GroupDetails] Auth error:', e);
        setError('You must be logged in to view this group.');
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchGroupDetails = async () => {
    if (!groupId) return;
    try {
      const result = await client.graphql({
        query: getGroupQuery,
        variables: { id: groupId },
      });
      console.log('[GroupDetails] getGroup result:', result);
      setGroup(result?.data?.getGroup || null);
    } catch (e) {
      console.error('[GroupDetails] Error fetching group:', e);
      setError('Failed to load group details.');
    }
  };

  const handleJoin = async () => {
    if (!currentUser?.userId || !groupId) return;
    setActionLoading(true);
    setError('');

    try {
      await client.graphql({
        query: createMemberMutation,
        variables: {
          input: {
            groupID: groupId,
            userID: currentUser.userId,
          },
        },
      });

      await fetchGroupDetails();
    } catch (e) {
      console.error('[GroupDetails] Error joining group:', e);
      setError(e?.errors?.[0]?.message || e.message || 'Failed to join group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUser?.userId || !group) return;

    const membership = group.members?.items?.find(
      (m) => m.userID === currentUser.userId
    );
    if (!membership) {
      setError("You aren't a member of this group.");
      return;
    }

    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await client.graphql({
        query: deleteMemberMutation,
        variables: { input: { id: membership.id } },
      });

      await fetchGroupDetails();
    } catch (e) {
      console.error('[GroupDetails] Error leaving group:', e);
      setError(e?.errors?.[0]?.message || e.message || 'Failed to leave group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!group || !groupId) return;

    if (
      !window.confirm(
        'Delete this group permanently? This will remove tasks and membership links.'
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await client.graphql({
        query: deleteGroupMutation,
        variables: { input: { id: groupId } },
      });

      alert('Group deleted.');
      navigateTo('Dashboard');
    } catch (e) {
      console.error('[GroupDetails] Error deleting group:', e);
      setError(e?.errors?.[0]?.message || e.message || 'Failed to delete group.');
    } finally {
      setActionLoading(false);
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
      <div className="page">
        <div className="page-header">
          <div className="page-title-block">
            <div className="page-title">Group not found</div>
            <div className="page-subtitle">
              We couldn&apos;t find this group. It may have been deleted.
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
      </div>
    );
  }

  const isMember = group.members?.items?.some(
    (m) => m.userID === currentUser?.userId
  );
  const isCreator = group.created_by === currentUser?.userId;

  const memberItems = group.members?.items || [];
  const taskItems = group.tasks?.items || [];
  const openTasks = taskItems.filter(
    (t) => t.status && t.status.toLowerCase() !== 'done'
  ).length;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">{group.title}</div>
          <div className="page-subtitle">
            {group.description || 'No description provided for this group yet.'}
          </div>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn"
            style={{ background: '#f3f4f6', color: '#111827' }}
            onClick={() => navigateTo('Dashboard')}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Group summary & actions */}
      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Group summary</div>
              <div className="card-subtitle">
                Created{' '}
                {group.createdAt
                  ? new Date(group.createdAt).toLocaleDateString()
                  : 'N/A'}{' '}
                • Owner: {isCreator ? 'You' : group.created_by}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '14px',
              flexWrap: 'wrap',
            }}
          >
            <span className="badge">
              👥 {memberItems.length} member
              {memberItems.length === 1 ? '' : 's'}
            </span>
            <span className="badge">
              ✅ {taskItems.length} task
              {taskItems.length === 1 ? '' : 's'} ({openTasks} open)
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigateTo('GroupChat', {
                  groupId: group.id,
                  title: group.title,
                })
              }
            >
              💬 Open Chat
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: '#eff6ff', color: '#1d4ed8' }}
              onClick={() =>
                navigateTo('GroupTasks', {
                  groupId: group.id,
                  title: group.title,
                })
              }
            >
              ✅ View Tasks
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </p>
            )}

            {!isMember && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ marginTop: 8 }}
                onClick={handleJoin}
                disabled={actionLoading}
              >
                {actionLoading ? 'Joining…' : 'Join this group'}
              </button>
            )}

            {isMember && !isCreator && (
              <button
                type="button"
                className="btn"
                style={{
                  marginTop: 8,
                  background: '#fee2e2',
                  color: '#b91c1c',
                }}
                onClick={handleLeave}
                disabled={actionLoading}
              >
                {actionLoading ? 'Leaving…' : 'Leave group'}
              </button>
            )}

            {isCreator && (
              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                  }}
                >
                  Owner actions
                </p>
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                  }}
                  onClick={handleDeleteGroup}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting…' : 'Delete group'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Members list */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 8 }}>
            <div>
              <div className="card-title">Members</div>
              <div className="card-subtitle">
                People currently in this project space.
              </div>
            </div>
          </div>

          {memberItems.length === 0 ? (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: 6,
              }}
            >
              No members yet. Be the first to join this group.
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: '6px 0 0',
                maxHeight: 260,
                overflowY: 'auto',
              }}
            >
              {memberItems.map((m) => {
                const u = m.user || {};
                const label =
                  u.full_name ||
                  u.email ||
                  `Member ${m.userID?.slice(0, 6) || 'Unknown'}`;

                const isYou = m.userID === currentUser?.userId;

                return (
                  <li
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>
                      <span>{label}</span>
                      {isYou && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            marginLeft: 6,
                            color: 'var(--primary-dark)',
                          }}
                        >
                          (you)
                        </span>
                      )}
                      {u.email && (
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {u.email}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupDetailsScreen;
