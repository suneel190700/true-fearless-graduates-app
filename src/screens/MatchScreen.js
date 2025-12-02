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
    const client = generateClient();

    useEffect(() => {
        calculateMatches();
    }, []);

    const calculateMatches = async () => {
        try {
            // 1. Get Current User ID
            const { userId } = await getCurrentUser();

            // 2. Fetch ALL users from DB
            // (Note: For a huge app, you'd filter on the backend. For MVP, this is fine.)
            const result = await client.graphql({ query: listUsersQuery });
            const allUsers = result.data.listUsers.items;

            // 3. Separate Current User from Candidates
            const currentUserProfile = allUsers.find(u => u.id === userId);
            const candidates = allUsers.filter(u => u.id !== userId);

            if (!currentUserProfile) {
                alert("Please complete your profile first.");
                navigateTo('CompleteProfile');
                return;
            }

            // 4. Run Logic
            const scores = getMatchScores(currentUserProfile, candidates);
            setMatches(scores);

        } catch (e) {
            console.error("Matching error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = (name) => {
        alert(`Invitation sent to ${name}! (This would send a notification in a full app)`);
    };

    return (
        <div className="form-container" style={{maxWidth: '800px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginRight: '15px'}}>&larr; Back</button>
                <h2>🤝 Teammate Recommendations</h2>
            </div>

            {loading && <p style={{textAlign: 'center'}}>Calculating AI matches...</p>}
            
            {!loading && matches.length === 0 && (
                <p style={{textAlign: 'center'}}>No matches found. Try updating your skills!</p>
            )}

            {matches.map((match) => (
                <div key={match.candidateId} className="card" style={{borderLeft: '5px solid var(--color-primary)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h3 style={{color: 'var(--color-primary)', margin: '0 0 5px 0'}}>
                                <button 
                                    onClick={() => navigateTo('ProfileViewer', { candidateId: match.candidateId })}
                                    style={{background:'none', border:'none', color:'inherit', fontSize:'inherit', fontWeight:'bold', cursor:'pointer', textDecoration:'underline'}}
                                >
                                    {match.fullName}
                                </button>
                            </h3>
                            <span style={{backgroundColor: '#e3f2fd', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85em', color: '#004d99', fontWeight: 'bold'}}>
                                {Math.round(match.totalScore * 100)}% Match
                            </span>
                        </div>
                        <button onClick={() => handleInvite(match.fullName)} className="btn btn-primary" style={{fontSize: '0.9em', padding: '8px 15px'}}>
                            Connect
                        </button>
                    </div>
                    <p style={{fontSize: '0.9em', color: '#666', marginTop: '15px'}}>
                        <strong>Score Breakdown:</strong> Skills: {Math.round(match.details.skillScore * 100)}% • 
                        Interests: {Math.round(match.details.interestScore * 100)}%
                    </p>
                </div>
            ))}
        </div>
    );
}

export default MatchScreen;