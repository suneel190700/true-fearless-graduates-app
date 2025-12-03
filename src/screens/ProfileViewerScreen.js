// src/screens/ProfileViewerScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      full_name
      email
      skills
      interests
      availability_hours
    }
  }
`;

const listOwnerGroupsQuery = `
  query ListGroupsForOwner($filter: ModelGroupFilterInput) {
    listGroups(filter: $filter) {
      items {
        id
        title
      }
    }
  }
`;

const createGroupMemberMutation = `
  mutation CreateGroupMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) {
      id
    }
  }
`;

function ProfileViewerScreen({ navigateTo, route }) {
  const candidateId = route?.params?.candidateId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [ownedGroups, setOwnedGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const client = generateClient();

  useEffect(() => {
    const init = async () => {
      if (!candidateId) {
        setError('No candidate specified.');
        setLoading(false);
        return;
      }

      try {
        setError('');
        setInviteError('');
        setInviteSuccess('');
        setLoading(true);
        setGroupsLoading(true);

        // Load current auth user (group owner)
        const authUser = await getCurrentUser().catch(() => null);
        if (authUser) {
          setCurrentUser(authUser);

          // Fetch groups where created_by == current user
          const groupsRes = await client.graphql({
            query: listOwnerGroupsQuery,
            variables: {
              filter: {
                created_by: { eq: authUser.userId },
              },
            },
          });

          const items = groupsRes?.data?.listGroups?.items || [];
          setOwnedGroups(items);
          if (items.length > 0) {
            setSelectedGroupId(items[0].id);
          }
        } else {
          setCurrentUser(null);
          setOwnedGroups([]);
        }

        // Fetch candidate profile
        const result = await client.graphql({
          query: getUserQuery,
          variables: { id: candidateId },
        });

        const user = result?.data?.getUser;
        console.log('[ProfileViewer] fetched user:', user);

        if (!user) {
          setError('Profile not found.');
          setProfile(null);
        } else {
          setProfile(user);
        }
      } catch (e) {
        console.error('[ProfileViewer] error:', e);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
        setGroupsLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const skillsText = profile?.skills?.length
    ? profile.skills.join(', ')
    : 'None listed';

  const interestsText = profile?.interests?.length
    ? profile.interests.join(', ')
    : 'None listed';

  const availabilityText =
    profile?.availability_hours != null
      ? `${profile.availability_hours} hours per week`
      : 'Not specified';

  const handleInvite = async () => {
    if (!profile?.id) {
      setInviteError('Profile not loaded yet.');
      return;
    }
    if (!currentUser) {
      setInviteError('You must be logged in to send invites.');
      return;
    }
    if (!selectedGroupId) {
      setInviteError('Please select a group first.');
      return;
    }

    setInviteError('');
    setInviteSuccess('');

    try {
      await client.graphql({
        query: createGroupMemberMutation,
        variables: {
          input: {
            groupID: selectedGroupId,
            userID: profile.id,
            role: 'member',
          },
        },
      });

      setInviteSuccess(
        'Invitation sent. The user has been added to this group as a member.'
      );
    } catch (e) {
      console.error('[ProfileViewer] invite error:', e);
      const msg =
        e?.errors?.[0]?.message ||
        e.message ||
        'Failed to send invite.';
      setInviteError(msg);
    }
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">
            {profile?.full_name || 'Profile'}
          </div>
          <div className="page-subtitle">
            {profile?.email || 'Loading candidate details…'}
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            style={{ background: '#f3f4f6', color: '#111827' }}
            onClick={() => navigateTo('MatchScreen')}
          >
            ← Back to Matching
          </button>
        </div>
      </div>

      <div className="card-grid">
        <div className="card" style={{ maxWidth: 520 }}>
          <div className="card-header" style={{ marginBottom: 8 }}>
            <div>
              <div className="card-title">Profile summary</div>
              <div className="card-subtitle">
                Skills, interests, and availability shared by this member.
              </div>
            </div>
          </div>

          {loading ? (
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                marginTop: 12,
              }}
            >
              Loading profile…
            </p>
          ) : error ? (
            <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
              {error}
            </p>
          ) : (
            <>
              {/* Basic info */}
              <div style={{ marginTop: 6, marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Name
                </div>
                <div style={{ fontWeight: 500 }}>
                  {profile?.full_name || 'Not provided'}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Email
                </div>
                <div style={{ fontWeight: 500 }}>
                  {profile?.email || 'Not provided'}
                </div>
              </div>

              {/* Skills */}
              <div style={{ marginTop: 8 }}>
                <h3
                  style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '5px',
                    marginTop: '10px',
                    fontSize: '0.95rem',
                  }}
                >
                  Skills
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                  }}
                >
                  {skillsText}
                </p>
              </div>

              {/* Interests */}
              <div style={{ marginTop: 8 }}>
                <h3
                  style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '5px',
                    marginTop: '10px',
                    fontSize: '0.95rem',
                  }}
                >
                  Interests
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                  }}
                >
                  {interestsText}
                </p>
              </div>

              {/* Availability */}
              <div style={{ marginTop: 8 }}>
                <h3
                  style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '5px',
                    marginTop: '10px',
                    fontSize: '0.95rem',
                  }}
                >
                  Availability
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                  }}
                >
                  {availabilityText}
                </p>
              </div>

              {/* Invite section */}
              <div style={{ marginTop: 16 }}>
                <h3
                  style={{
                    borderBottom: '1px solid #eee',
                    paddingBottom: '5px',
                    marginTop: '10px',
                    fontSize: '0.95rem',
                  }}
                >
                  Invite to your group
                </h3>

                {currentUser ? (
                  groupsLoading ? (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginTop: 6,
                      }}
                    >
                      Loading your groups…
                    </p>
                  ) : ownedGroups.length === 0 ? (
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginTop: 6,
                      }}
                    >
                      You don&apos;t own any groups yet. Create a group first,
                      then invite members here.
                    </p>
                  ) : (
                    <>
                      <label
                        style={{
                          marginTop: 8,
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        Select a group
                      </label>
                      <select
                        className="input-field"
                        style={{ maxWidth: 320 }}
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                      >
                        {ownedGroups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title || 'Untitled group'}
                          </option>
                        ))}
                      </select>

                      {inviteError && (
                        <p
                          style={{
                            color: 'var(--danger)',
                            fontSize: '0.85rem',
                            marginTop: 4,
                          }}
                        >
                          {inviteError}
                        </p>
                      )}
                      {inviteSuccess && (
                        <p
                          style={{
                            color: '#15803d',
                            fontSize: '0.85rem',
                            marginTop: 4,
                          }}
                        >
                          {inviteSuccess}
                        </p>
                      )}

                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: 6 }}
                        onClick={handleInvite}
                      >
                        Invite to group
                      </button>
                    </>
                  )
                ) : (
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginTop: 6,
                    }}
                  >
                    Sign in as a group owner to invite this member into your projects.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileViewerScreen;
