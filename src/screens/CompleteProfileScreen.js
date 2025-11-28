import React, { useState, useEffect } from 'react';

function CompleteProfileScreen({ navigateTo }) {
    const [skills, setSkills] = useState('');
    const [interests, setInterests] = useState('');
    const [availabilityHours, setAvailabilityHours] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // 1. Fetch Existing Profile (Pre-fill data for Editing)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    // If no token, redirect to login (or handle appropriately)
                    return;
                }

                const response = await fetch('https://tfg-backend-x926.onrender.com/api/users/profile', {
                    headers: { 'x-auth-token': token }
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Pre-fill fields if data exists
                    if (data.skills) setSkills(Array.isArray(data.skills) ? data.skills.join(', ') : data.skills);
                    if (data.interests) setInterests(Array.isArray(data.interests) ? data.interests.join(', ') : data.interests);
                    if (data.availability_hours) setAvailabilityHours(data.availability_hours);
                    
                    // If skills exist, we are in editing mode
                    if (data.skills && data.skills.length > 0) setIsEditing(true);
                }
            } catch (e) {
                console.error("Error loading profile:", e);
            }
        };
        fetchProfile();
    }, []);

    // 2. Handle Submit (Update via API)
    const handleProfileSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("You must be logged in.");
            return;
        }
        
        if (!skills || !interests || !availabilityHours) {
            setError("All fields are required.");
            return;
        }

        setError(null);
        setLoading(true);
        
        // Convert comma-separated strings to arrays for PostgreSQL
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
        const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);

        try {
            const response = await fetch('https://tfg-backend-x926.onrender.com/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    skills: skillsArray,
                    interests: interestsArray,
                    availabilityHours: parseInt(availabilityHours)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            alert("Profile saved successfully!");
            navigateTo('Dashboard'); 

        } catch (e) {
            console.error("Profile Error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{maxWidth: '500px'}}>
            <h2>{isEditing ? "Edit Your Profile" : "Complete Your Profile"}</h2>
            <p>Tell us about your skills and availability so we can find your ideal teammates!</p>
            
            <label>Skills (Comma separated: e.g., React, Python, Figma)</label>
            <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="input-field"
                placeholder="React, Node.js, Design"
            />
            
            <label>Interests (Comma separated: e.g., AI, Fintech, Gaming)</label>
            <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="input-field"
                placeholder="AI, Web3, Startups"
            />
            
            <label>Weekly Availability (Hours)</label>
            <input
                type="number"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                min="1"
                max="50"
                className="input-field"
                placeholder="10"
            />
            
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <button
                onClick={handleProfileSubmit}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '15px' }}
            >
                {loading ? "Saving..." : "Save Profile"}
            </button>
            
            <button
                onClick={() => navigateTo('Dashboard')}
                className="btn"
                style={{ width: '100%', marginTop: '10px', backgroundColor: '#e0e0e0', color: 'black' }}
            >
                Cancel
            </button>
        </div>
    );
}

export default CompleteProfileScreen;