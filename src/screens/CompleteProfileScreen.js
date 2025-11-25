// src/screens/CompleteProfileScreen.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig'; // Import Firestore database
import { doc, setDoc } from "firebase/firestore"; 
import { auth } from '../firebaseConfig'; // Import Auth to get the user ID

function CompleteProfileScreen({ navigateTo }) {
    // 1. State for data collection
    const [skills, setSkills] = useState(''); // e.g., "React, Python, Figma"
    const [interests, setInterests] = useState(''); // e.g., "AI, Fintech, Gaming"
    const [availabilityHours, setAvailabilityHours] = useState(''); // e.g., "10"
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // 2. Data processing and submission
    const handleProfileSubmit = async () => {
        const user = auth.currentUser;
        if (!user) {
            setError("User not authenticated. Please log in again.");
            return;
        }

        if (!skills || !interests || !availabilityHours) {
            setError("All fields are required to complete your profile.");
            return;
        }

        setError(null);
        setLoading(true);
        
        // Prepare data for Firestore: converting strings to arrays/numbers
        const profileData = {
            // Split strings into arrays for easy matching later
            skills: skills.split(',').map(s => s.trim()), 
            interests: interests.split(',').map(i => i.trim()),
            availabilityHours: parseInt(availabilityHours),
            createdAt: new Date().toISOString()
        };

        try {
            // 3. Save profile data to the Firestore 'users' collection 
            // The document ID is set to the user's unique Firebase UID
            await setDoc(doc(db, "users", user.uid), profileData, { merge: true });

            console.log("Profile created successfully for:", user.uid);
            
            // 4. Success! Redirect to the Dashboard
            navigateTo('Dashboard'); 

        } catch (e) {
            console.error("Profile submission error:", e.message);
            setError("Error saving profile. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'left', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Complete Your Profile</h2>
            <p>Tell us about your skills and availability so we can find your ideal teammates!</p>
            
            <label>Skills (Comma separated: e.g., React, Python, Figma)</label>
            <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                style={{ padding: '10px', margin: '5px 0 15px 0', width: '100%', boxSizing: 'border-box' }}
            />
            
            <label>Interests (Comma separated: e.g., AI, Fintech, Gaming)</label>
            <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                style={{ padding: '10px', margin: '5px 0 15px 0', width: '100%', boxSizing: 'border-box' }}
            />
            
            <label>Weekly Availability (Hours)</label>
            <input
                type="number"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                min="1"
                max="50"
                style={{ padding: '10px', margin: '5px 0 15px 0', width: '100%', boxSizing: 'border-box' }}
            />
            
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <button
                onClick={handleProfileSubmit}
                disabled={loading}
                style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}
            >
                {loading ? "Saving Profile..." : "Complete & Go to Dashboard"}
            </button>
        </div>
    );
}

export default CompleteProfileScreen;