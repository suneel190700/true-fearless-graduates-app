// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// List all groups with members, creator and tags
const listGroupsQuery = `
  query ListGroups {
    listGroups {
      items {
        id
        title
        description
        createdAt
        created_by
        tags
        members {
          items {
            id
            userID
            role
          }
        }
      }
    }
  }
`;

function DashboardScreen({ navigateTo }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');

  const client = generateClient();

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (e) {
        console.error('[Dashboard] Auth error:', e);
        setAuthError('Could not load current user.');
      } finally {
        fetchGroups();
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.graphql({ query: listGroupsQuery });
      const items = res?.data?.listGroups?.items || [];
      // Sort newest first
      items.sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
      setGroups(items);
    } catch (e) {
      console.error('[Dashboard] Error fetching groups:', e);
      setError('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigateTo('Login');
    } catch (e) {
      console.error('[Dashboard] signOut error:', e);
      alert('Error signing out. See console for details.');
    }
  };

  const filteredGroups = groups.filter((g) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const title = (g.title || '').toLowerCase();
    const desc = (g.description || '').toLowerCase();
    const tags = (g.tags || []).join(' ').toLowerCase();
    return title.includes(q) || desc.includes(q) || tags.includes(q);
  });

  const getUserRoleInGroup = (group) => {
    if (!currentUser) return null;
    const userId = currentUser.userId;
    if (group.created_by === userId) return 'owner';
    const membership = group.members?.items?.find((m) => m.userID === userId);
    if (!membership) return null;
    return membership.role || 'member';
  };

  const roleBadgeStyle = (role) => {
    if (role === 'owner') {
      return {
        background: '#eef2ff',
        color: '#4f46e5',
        border: '1px solid #e5e7eb',
      };
    }
    if (role === 'member') {
      return {
        background: '#ecfdf3',
        color: '#15803d',
        border: '1px solid #dcfce7',
      };
    }
    return {
      background: '#f3f4f6',
      color: '#4b5563',
      border: '1px solid #e5e7eb',
    };
  };

  const userEmail =
    currentUser?.signInDetails?.loginId || currentUser?.username || '';

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            Overview of your collaboration projects, groups, and teammates.
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            onClick={fetchGroups}
            style={{ marginRight: 8 }}
          >
            Refresh
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigateTo('CompleteProfile')}
            style={{ marginRight: 8 }}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: '#fee2e2', color: '#b91c1c' }}
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Info / quick actions */}
      <div className="card-grid" style={{ marginBottom: 12 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Your projects</div>
              <div className="card-subtitle">
                You&apos;re currently in {groups.length} group
                {groups.length === 1 ? '' : 's'}.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigateTo('CreateGroup')}
            >
              + Create new project
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Smart Matching</div>
              <div className="card-subtitle">
                Find collaborators based on skills, interests, and availability.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn"
              onClick={() => navigateTo('MatchScreen')}
            >
              View matches
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Analytics</div>
              <div className="card-subtitle">
                See activity and engagement across your projects.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              className="btn"
              onClick={() => navigateTo('Analytics')}
            >
              Open analytics
            </button>
          </div>
        </div>
      </div>

      {/* Search + errors */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          gap: 12,
        }}
      >
        <input
          type="text"
          className="input-field"
          placeholder="Search projects by title, description, or tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 320, marginBottom: 0 }}
        />
        {authError && (
          <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>
            {authError}
          </span>
        )}
      </div>
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{error}</p>
      )}

      {/* Groups list */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="card-title">Your groups</div>
            <div className="card-subtitle">
              Click into a group to view details, chat, and manage tasks.
            </div>
          </div>
        </div>

        {loading ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginTop: 18,
            }}
          >
            Loading projects…
          </p>
        ) : filteredGroups.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginTop: 18,
            }}
          >
            No projects match your search yet. Try clearing the search box or
            create a new project.
          </p>
        ) : (
          <div
            className="card-grid"
            style={{
              marginTop: 6,
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {filteredGroups.map((group) => {
              const role = getUserRoleInGroup(group);
              const tags = group.tags || [];
              const createdDate = group.createdAt
                ? new Date(group.createdAt).toLocaleDateString()
                : '';

              return (
                <div
                  key={group.id}
                  className="card"
                  style={{
                    borderLeft: '4px solid var(--primary)',
                    boxShadow: '0 10px 25px rgba(15,23,42,0.06)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          marginBottom: 2,
                        }}
                      >
                        {group.title || 'Untitled group'}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {group.description
                          ? group.description.length > 90
                            ? group.description.slice(0, 90) + '…'
                            : group.description
                          : 'No description yet.'}
                      </div>
                    </div>
                    {role && (
                      <span
                        style={{
                          alignSelf: 'flex-start',
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: '0.75rem',
                          textTransform: 'capitalize',
                          ...roleBadgeStyle(role),
                        }}
                      >
                        {role}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 6,
                        marginTop: 6,
                      }}
                    >
                      {tags.map((t, idx) => (
                        <span
                          key={`${group.id}-${t}-${idx}`}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            fontSize: '0.75rem',
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

                  {/* Footer actions */}
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {createdDate && <>Created {createdDate}</>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '0.8rem',
                        }}
                        onClick={() =>
                          navigateTo('GroupDetails', {
                            groupId: group.id,
                            title: group.title,
                          })
                        }
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: '#f3f4f6',
                          fontSize: '0.8rem',
                        }}
                        onClick={() =>
                          navigateTo('GroupChat', {
                            groupId: group.id,
                            title: group.title,
                          })
                        }
                      >
                        Chat
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{
                          background: '#0ea5e9',
                          color: '#ffffff',
                          fontSize: '0.8rem',
                        }}
                        onClick={() =>
                          navigateTo('GroupTasks', {
                            groupId: group.id,
                            title: group.title,
                          })
                        }
                      >
                        Tasks
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Signed-in user indicator */}
      {userEmail && (
        <div
          style={{
            marginTop: 16,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            textAlign: 'right',
          }}
        >
          Signed in as {userEmail}
        </div>
      )}
    </div>
  );
}

export default DashboardScreen;
