// src/screens/ProfileViewerScreen.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from "firebase/firestore"; 

function ProfileViewerScreen({ navigateTo, route }) {
    const candidateId = route.params?.candidateId;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!candidateId) {
            setError("Candidate ID not found.");
            setLoading(false);
            return;
        }

        const fetchCandidateProfile = async () => {
            try {
                const docRef = doc(db, "users", candidateId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                } else {
                    setError("Profile data unavailable.");
                }
            } catch (e) {
                console.error("Error fetching profile:", e);
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidateProfile();
    }, [candidateId]);

    if (loading) return <p className="form-container" style={{ textAlign: 'center' }}>Loading Profile...</p>;
    if (error) return <p className="form-container" style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>;
    if (!profile) return null;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => navigateTo('MatchScreen')} className="btn" style={{ marginBottom: '20px' }}>
                &larr; Back to Matches
            </button>
            
            <div className="card">
                <h2>Candidate Profile</h2>
                <p><strong>User ID:</strong> {candidateId}</p>
                
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '20px' }}>Skills</h3>
                <p>{profile.skills ? profile.skills.join(', ') : 'N/A'}</p>
                
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '20px' }}>Interests</h3>
                <p>{profile.interests ? profile.interests.join(', ') : 'N/A'}</p>
                
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '20px' }}>Availability</h3>
                <p>{profile.availabilityHours || 'N/A'} hours per week</p>
            </div>
            
        </div>
    );
}

export default ProfileViewerScreen;