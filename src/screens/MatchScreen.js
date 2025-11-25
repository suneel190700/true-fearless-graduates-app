// src/screens/MatchScreen.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getMatchScores } from '../utils/matchingLogic'; // <-- Import logic

function MatchScreen({ navigateTo }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const runMatching = async () => {
            if (!currentUser) {
                setError("User not logged in.");
                setLoading(false);
                return;
            }

            try {
                // 1. Fetch current user's profile
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (!userDoc.exists()) {
                    setError("Complete your profile first!");
                    setLoading(false);
                    return;
                }
                const currentUserProfile = { id: currentUser.uid, ...userDoc.data() };

                // 2. Fetch all other user profiles
                const usersSnapshot = await getDocs(collection(db, "users"));
                const allCandidateProfiles = usersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }));

                // 3. Run the matching algorithm
                const calculatedScores = getMatchScores(currentUserProfile, allCandidateProfiles);
                
                setMatches(calculatedScores);

            } catch (e) {
                console.error("Matching Error:", e);
                setError("Failed to run matching. Check console.");
            } finally {
                setLoading(false);
            }
        };

        runMatching();
    }, [currentUser]);


    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🤝 Teammate Recommendations</h2>
            <p>We found {matches.length} potential teammates based on your profile:</p>

            <button onClick={() => navigateTo('Dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
                &larr; Back to Dashboard
            </button>
            
            {loading && <p>Calculating match scores...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            
            {matches.map((match, index) => (
                <div key={match.candidateId} style={{ border: `2px solid #007bff`, padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                    
                    <h3 style={{ color: '#007bff' }}>Match Score: {Math.round(match.totalScore * 100)}%</h3>
                    <p>Candidate User ID: {match.candidateId.substring(0, 8)}...</p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                        (Contribution: Skill ({Math.round(match.details.skillScore * 100)}%), 
                        Interest ({Math.round(match.details.interestScore * 100)}%), 
                        Availability ({Math.round(match.details.availabilityScore * 100)}%))
                    </p>
                    
                    {/* Placeholder for future "Invite to Group" feature */}
                </div>
            ))}
        </div>
    );
}

export default MatchScreen;