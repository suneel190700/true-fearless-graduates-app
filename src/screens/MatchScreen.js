// src/screens/MatchScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { getMatchScores } from '../utils/matchingLogic';

const listUsersQuery = `
  query ListUsers {
    listUsers {
      items {
        id
        full_name
        skills
        interests
        availability_hours
      }
    }
  }
`;

function MatchScreen({ navigateTo }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const client = generateClient();

  useEffect(() => {
    const runMatching = async () => {
      try {
        setError('');
        setLoading(true);

        const { userId } = await getCurrentUser();
        console.log('[Match] current userId:', userId);

        const result = await client.graphql({ query: listUsersQuery });
        const allUsers = result?.data?.listUsers?.items || [];
        console.log('[Match] all users:', allUsers);

        const currentUserProfile = allUsers.find((u) => u.id === userId);
        const candidates = allUsers.filter((u) => u.id !== userId);

        if (!currentUserProfile) {
          alert('Please complete your profile first so we can match you.');
          navigateTo('CompleteProfile');
          return;
        }

        const scores = getMatchScores(currentUserProfile, candidates);
        console.log('[Match] scores:', scores);
        setMatches(scores);
      } catch (e) {
        console.error('[Match] error:', e);
        setError('Failed to calculate matches. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    runMatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewProfile = (candidateId) => {
    navigateTo('ProfileViewer', { candidateId });
  };

  const handleConnect = (candidateId) => {
    navigateTo('ProfileViewer', { candidateId });
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Smart Matching</div>
          <div className="page-subtitle">
            We compare your skills, interests, and availability to find ideal collaborators.
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

      {/* Info card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">How this works</div>
            <div className="card-subtitle">
              We compute a weighted score:
              {' '}
              <strong>skills (60%)</strong>, <strong>interests (30%)</strong>, and
              {' '}
              <strong>availability (10%)</strong>.
            </div>
          </div>
        </div>
        {loading && (
          <p
            style={{
              marginTop: 10,
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            Calculating AI-style matches for you…
          </p>
        )}
        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 8 }}>
            {error}
          </p>
        )}
      </div>

      {/* Matches list */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="card-title">Top matches</div>
            <div className="card-subtitle">
              Click a name to view their profile and invite them to your group.
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
            Loading matches…
          </p>
        ) : matches.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginTop: 18,
            }}
          >
            No strong matches found yet. Try updating your skills and interests in your profile.
          </p>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginTop: 4,
            }}
          >
            {matches.map((match) => (
              <div
                key={match.candidateId}
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
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => handleViewProfile(match.candidateId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {match.fullName}
                    </button>
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Overall match score
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        background: 'var(--primary-soft)',
                        color: 'var(--primary-dark)',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'inline-block',
                      }}
                    >
                      {Math.round(match.totalScore * 100)}% Match
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 10,
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      margin: 0,
                    }}
                  >
                    <strong>Score breakdown:</strong>{' '}
                    Skills: {Math.round(match.details.skillScore * 100)}% ·{' '}
                    Interests: {Math.round(match.details.interestScore * 100)}% ·{' '}
                    Availability: {Math.round(match.details.availabilityScore * 100)}%
                  </p>

                  <button
                    type="button"
                    onClick={() => handleConnect(match.candidateId)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                  >
                    View & Invite
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchScreen;
