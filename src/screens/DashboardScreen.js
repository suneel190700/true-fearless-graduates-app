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

// Get current user's profile
const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      full_name
      email
      role
      skills
      interests
      availability_hours
      profilePic
    }
  }
`;

// Same completeness logic as CompleteProfile
function computeProfileCompleteness({ skills, interests, availabilityHours, profilePic }) {
  let total = 4;
  let score = 0;

  const hasSkills = Array.isArray(skills)
    ? skills.length > 0
    : typeof skills === 'string' && skills.trim().length > 0;

  const hasInterests = Array.isArray(interests)
    ? interests.length > 0
    : typeof interests === 'string' && interests.trim().length > 0;

  const hoursNum = parseInt(availabilityHours, 10);
  const hasAvailability = !isNaN(hoursNum) && hoursNum > 0;

  const hasPic = !!profilePic;

  if (hasSkills) score++;
  if (hasInterests) score++;
  if (hasAvailability) score++;
  if (hasPic) score++;

  return Math.round((score / total) * 100);
}

function DashboardScreen({ navigateTo }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState('');

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  const client = generateClient();

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

  const fetchProfile = async (userId) => {
    try {
      setProfileError('');
      const res = await client.graphql({
        query: getUserQuery,
        variables: { id: userId },
      });
      const user = res?.data?.getUser;
      setProfile(user || null);
      if (!user) {
        setProfileError('Profile not found. Update your profile to improve matching.');
      }
    } catch (e) {
      console.error('[Dashboard] Error fetching profile:', e);
      setProfileError('Failed to load your profile.');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        if (user?.userId) {
          await fetchProfile(user.userId);
        }
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigateTo('Login');
    } catch (e) {
      console.error('[Dashboard] signOut error:', e);
      alert('Error signing out. See console for details.');
    }
  };

  // Role of current user in a given group
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

  // All groups filtered by search
  const filteredGroups = groups.filter((g) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const title = (g.title || '').toLowerCase();
    const desc = (g.description || '').toLowerCase();
    const tags = (g.tags || []).join(' ').toLowerCase();
    return title.includes(q) || desc.includes(q) || tags.includes(q);
  });

  // Groups where the user is owner or member
  const userGroups = groups.filter((g) => !!getUserRoleInGroup(g));
  const filteredUserGroups = filteredGroups.filter((g) => !!getUserRoleInGroup(g));

  const userEmail =
    currentUser?.signInDetails?.loginId || currentUser?.username || '';

  // Profile completeness
  let completion = null;
  let completionLabel = '';
  if (profile) {
    completion = computeProfileCompleteness({
      skills: profile.skills,
      interests: profile.interests,
      availabilityHours: profile.availability_hours,
      profilePic: profile.profilePic,
    });

    if (completion < 50) {
      completionLabel = 'Let’s get the basics in place.';
    } else if (completion < 100) {
      completionLabel = 'Looking good! A few more details to reach 100%.';
    } else {
      completionLabel = 'Nice! Your profile is complete and match-ready.';
    }
  }

  const displayName =
    profile?.full_name ||
    userEmail?.split('@')[0] ||
    'Student';

  const displayRole = profile?.role || 'Student';

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            Overview of collaboration projects, groups, and teammates.
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

      {/* Mini profile widget */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            {displayName
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('')}
          </div>

          {/* Text + completeness */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginTop: 2,
                  }}
                >
                  {displayRole}
                  {userEmail && ` · ${userEmail}`}
                </div>
                {profileError && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: '0.8rem',
                      color: 'var(--danger)',
                    }}
                  >
                    {profileError}
                  </div>
                )}
              </div>

              {completion !== null && (
                <div style={{ minWidth: 220, maxWidth: 320 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                      fontSize: '0.8rem',
                      fontWeight: 500,
                    }}
                  >
                    <span>Profile completeness</span>
                    <span>{completion}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 7,
                      borderRadius: 999,
                      background: '#e5e7eb',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${completion}%`,
                        height: '100%',
                        background:
                          completion === 100
                            ? '#16a34a'
                            : 'var(--primary, #2563eb)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {completionLabel}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => navigateTo('CompleteProfile')}
            style={{
              fontSize: '0.8rem',
              padding: '6px 12px',
            }}
          >
            Update profile
          </button>
        </div>
      </div>

      {/* Quick actions (only Matching + Analytics to avoid duplicates) */}
      <div className="card-grid" style={{ marginBottom: 12 }}>
        {/* Smart Matching */}
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

        {/* Analytics */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Analytics</div>
              <div className="card-subtitle">
                See activity and engagement across projects.
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

      {/* ALL PROJECTS CARD */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="card-title">All projects</div>
            <div className="card-subtitle">
              Browse every collaboration space. Your role is highlighted on each card.
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
              const isMember = !!role;
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
                      {!isMember && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            marginTop: 2,
                          }}
                        >
                          You&apos;re not a member of this group.
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* Everyone can VIEW */}
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

                      {/* Only members/owners see Chat + Tasks */}
                      {isMember && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* YOUR GROUPS CARD */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="card-title">Your groups</div>
            <div className="card-subtitle">
              Spaces where you&apos;re an owner or member.
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
            Loading your groups…
          </p>
        ) : filteredUserGroups.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginTop: 18,
            }}
          >
            You&apos;re not in any groups yet. Try joining or creating a project.
          </p>
        ) : (
          <div
            className="card-grid"
            style={{
              marginTop: 6,
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {filteredUserGroups.map((group) => {
              const role = getUserRoleInGroup(group);
              const tags = group.tags || [];
              const createdDate = group.createdAt
                ? new Date(group.createdAt).toLocaleDateString()
                : '';

              return (
                <div
                  key={`my-${group.id}`}
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
                          key={`my-${group.id}-${t}-${idx}`}
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
