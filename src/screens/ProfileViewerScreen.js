// src/screens/ProfileViewerScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

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

function ProfileViewerScreen({ navigateTo, route }) {
  const candidateId = route?.params?.candidateId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const client = generateClient();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!candidateId) {
        setError('No candidate specified.');
        setLoading(false);
        return;
      }

      try {
        setError('');
        const result = await client.graphql({
          query: getUserQuery,
          variables: { id: candidateId },
        });

        const user = result?.data?.getUser;
        console.log('[ProfileViewer] fetched user:', user);

        if (!user) {
          setError('Profile not found.');
        } else {
          setProfile(user);
        }
      } catch (e) {
        console.error('[ProfileViewer] error:', e);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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

  return (
    <div className="page">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileViewerScreen;
