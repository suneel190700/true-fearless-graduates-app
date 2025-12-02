import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';

const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      skills
      interests
      availability_hours
      profilePic
      full_name
    }
  }
`;

const updateUserMutation = `
  mutation UpdateUser($input: UpdateUserInput!, $condition: ModelUserConditionInput) {
    updateUser(input: $input, condition: $condition) {
      id
      profilePic
      skills
      interests
      availability_hours
    }
  }
`;

function CompleteProfileScreen({ navigateTo }) {
    const [skills, setSkills] = useState('');
    const [interests, setInterests] = useState('');
    const [availabilityHours, setAvailabilityHours] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const client = generateClient();

    // Convert array → "React, Node"
    const normalizeToString = (val) => {
        if (!val) return '';
        if (Array.isArray(val)) return val.join(', ');
        if (typeof val === 'string') return val;
        return '';
    };

    // Convert "React,Node" → ["React","Node"]
    const normalizeToArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
            return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    };

    // Load User Data
    const loadProfile = async () => {
        try {
            const { userId } = await getCurrentUser();
            const result = await client.graphql({
                query: getUserQuery,
                variables: { id: userId }
            });

            const data = result.data.getUser;

            if (data) {
                setSkills(normalizeToString(data.skills));
                setInterests(normalizeToString(data.interests));
                setAvailabilityHours(data.availability_hours || '');
            }
        } catch (e) {
            console.error("Error loading profile:", e);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { userId } = await getCurrentUser();
            let profilePicPath = null;

            // Upload image
            if (file) {
                const path = `public/avatars/${userId}-${Date.now()}.png`;
                const result = await uploadData({
                    path: path,
                    data: file
                }).result;

                profilePicPath = result.path;
            }

            const input = {
                id: userId,
                skills: normalizeToArray(skills),
                interests: normalizeToArray(interests),
                availability_hours: Number(availabilityHours) || 0
            };

            if (profilePicPath) input.profilePic = profilePicPath;

            // ⭐ THIS is the DynamoDB fix
            await client.graphql({
                query: updateUserMutation,
                variables: {
                    input,
                    condition: {}   // CRITICAL FIX
                }
            });

            alert("Profile updated successfully!");
            navigateTo("Dashboard");

        } catch (e) {
            console.log("SAVE ERROR RAW →", JSON.stringify(e, null, 2));
            alert("Failed to save: " + e?.errors?.[0]?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ maxWidth: '500px' }}>
            <h2>Edit Profile</h2>

            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>
                    Profile Picture
                </label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <label>Skills (Comma separated)</label>
            <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="input-field"
                placeholder="React, Node, Design"
            />

            <label>Interests (Comma separated)</label>
            <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="input-field"
                placeholder="AI, Gaming"
            />

            <label>Weekly Availability (Hours)</label>
            <input
                type="number"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                className="input-field"
            />

            <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '15px' }}
            >
                {loading ? "Saving..." : "Save Profile"}
            </button>

            <button
                onClick={() => navigateTo("Dashboard")}
                className="btn"
                style={{ width: '100%', marginTop: '10px', background: '#eee' }}
            >
                Cancel
            </button>
        </div>
    );
}

export default CompleteProfileScreen;
