import React, { useState, useEffect } from 'react';

function MatchScreen({ navigateTo }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError("Please log in to see matches.");
                    setLoading(false);
                    return;
                }

                // Call the Enterprise API
                const response = await fetch('https://tfg-backend-x926.onrender.com/api/matches', {
                    headers: { 'x-auth-token': token }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch matches');
                }

                setMatches(data);

            } catch (e) {
                console.error("Matching Error:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    const handleInvite = (name) => {
        alert(`Invitation sent to ${name}!`);
    };

    return (
        <div className="form-container" style={{maxWidth: '800px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginRight: '15px'}}>
                    &larr; Back
                </button>
                <h2>🤝 Teammate Recommendations</h2>
            </div>

            {loading && <p style={{textAlign: 'center'}}>Calculating AI matches...</p>}
            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}
            
            {!loading && matches.length === 0 && !error && (
                <p style={{textAlign: 'center'}}>No matches found yet. Try updating your profile skills/interests!</p>
            )}

            {matches.map((match) => (
                <div key={match.candidateId} className="card" style={{borderLeft: '5px solid var(--color-primary)', cursor: 'default'}}>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <h3 style={{color: 'var(--color-primary)', margin: '0 0 5px 0'}}>
                                {match.fullName} 
                            </h3>
                            <span style={{backgroundColor: '#e3f2fd', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85em', color: '#004d99', fontWeight: 'bold'}}>
                                {Math.round(match.totalScore * 100)}% Match
                            </span>
                        </div>
                        <button 
                            onClick={() => handleInvite(match.fullName)}
                            className="btn btn-primary"
                            style={{fontSize: '0.9em', padding: '8px 15px'}}
                        >
                            Connect
                        </button>
                    </div>

                    <p style={{fontSize: '0.9em', color: '#666', marginTop: '15px'}}>
                        <strong>Why?</strong> Skill Overlap: {Math.round(match.details.skillScore * 100)}% • 
                        Interest Match: {Math.round(match.details.interestScore * 100)}% • 
                        Availability: {Math.round(match.details.availabilityScore * 100)}%
                    </p>
                </div>
            ))}
        </div>
    );
}

export default MatchScreen;