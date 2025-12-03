// src/screens/GroupDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

// QUERIES & MUTATIONS
const getGroupQuery = `
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
      id
      title
      description
      created_by
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
  mutation CreateMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) {
      id
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

function GroupDetailsScreen({ navigateTo, route }) {
  const groupId = route?.params?.groupId;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const client = generateClient();

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        await fetchGroupDetails();
      } catch (e) {
        console.error('Auth Error', e);
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
      setGroup(res?.data?.getGroup);
    } catch (e) {
      console.error('Error loading group', e);
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
            role: 'member', // NEW
          },
        },
      });

      alert('Joined successfully!');
      await fetchGroupDetails();
    } catch (e) {
      console.error('Join Error Detailed:', e);
      alert(
        'Error joining group: ' + (e.errors?.[0]?.message || e.message)
      );
    }
  };

  const handleLeave = async () => {
    if (!currentUser) return;
    if (!window.confirm('Leave this group?')) return;

    try {
      const membership = group.members.items.find(
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
      console.error('Leave Error:', e);
      alert('Error leaving group');
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
      console.error('Delete Error:', e);
      alert('Error deleting group');
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: 'center', marginTop: '50px' }}>
        Loading Group...
      </p>
    );
  if (!group)
    return (
      <p style={{ textAlign: 'center', marginTop: '50px' }}>
        Group not found.
      </p>
    );

  const isMember = group.members?.items?.some(
    (m) => m.userID === currentUser?.userId
  );
  const isCreator = group.created_by === currentUser?.userId;

  const getRoleLabel = (member) => {
    if (member.role) return member.role;
    // Fallback for old data: infer from created_by
    if (member.userID === group.created_by) return 'owner';
    return 'member';
  };

  return (
    <div className="form-container" style={{ maxWidth: '800px', textAlign: 'left' }}>
      <button
        onClick={() => navigateTo('Dashboard')}
        className="btn"
        style={{ marginBottom: '20px' }}
      >
        &larr; Back
      </button>

      <h1
        style={{
          borderBottom: '2px solid var(--primary)',
          paddingBottom: '10px',
        }}
      >
        {group.title}
      </h1>
      <p style={{ fontSize: '1.05rem' }}>{group.description}</p>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Members ({group.members?.items?.length || 0})</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: 10 }}>
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
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  {m.user ? m.user.full_name : 'Unknown User'}
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

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        {isMember ? (
          <>
            <button
              className="btn btn-secondary"
              style={{ marginRight: '10px' }}
              onClick={() => navigateTo('GroupChat', { groupId })}
            >
              💬 Chat
            </button>
            <button
              className="btn"
              style={{
                marginRight: '10px',
                background: '#0ea5e9',
                color: 'white',
              }}
              onClick={() => navigateTo('GroupTasks', { groupId })}
            >
              ✅ Tasks
            </button>
            {!isCreator && (
              <button
                onClick={handleLeave}
                className="btn btn-danger"
              >
                Leave Group
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleJoin}
            className="btn btn-primary"
          >
            Join this Group
          </button>
        )}

        {isCreator && (
          <div
            style={{
              marginTop: '30px',
              borderTop: '1px solid #eee',
              paddingTop: '20px',
            }}
          >
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Owner Actions
            </p>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete My Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetailsScreen;
