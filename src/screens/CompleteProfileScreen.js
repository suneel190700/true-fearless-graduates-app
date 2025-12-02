import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage'; // NEW: Import Storage

const getUserQuery = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      skills
      interests
      availability_hours
      profilePic
    }
  }
`;

const updateUserMutation = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      profilePic
    }
  }
`;

function CompleteProfileScreen({ navigateTo }) {
    const [skills, setSkills] = useState('');
    const [interests, setInterests] = useState('');
    const [availabilityHours, setAvailabilityHours] = useState('');
    const [file, setFile] = useState(null); // Store selected file
    const [loading, setLoading] = useState(false);
    const client = generateClient();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { userId } = await getCurrentUser();
            const result = await client.graphql({
                query: getUserQuery,
                variables: { id: userId }
            });
            const data = result.data.getUser;
            if (data) {
                if (data.skills) setSkills(data.skills.join(', '));
                if (data.interests) setInterests(data.interests.join(', '));
                if (data.availability_hours) setAvailabilityHours(data.availability_hours);
            }
        } catch (e) { console.error("Error loading profile", e); }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) setFile(selected);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { userId } = await getCurrentUser();
            let profilePicKey = null;

            // 1. Upload Image to S3 (if a file was selected)
            if (file) {
                const fileName = `avatars/${userId}-${Date.now()}.png`;
                const result = await uploadData({
                    key: fileName,
                    data: file,
                    options: {
                        accessLevel: 'protected' // Publicly readable (so others can see it)
                    }
                }).result;
                profilePicKey = result.key;
            }

            // 2. Prepare Data for DB
            const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
            const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);
            
            const input = {
                id: userId,
                skills: skillsArray,
                interests: interestsArray,
                availability_hours: parseInt(availabilityHours) || 0
            };

            // Only update profilePic if a new one was uploaded
            if (profilePicKey) {
                input.profilePic = profilePicKey;
            }

            // 3. Save to DynamoDB
            await client.graphql({
                query: updateUserMutation,
                variables: { input }
            });

            alert("Profile Saved!");
            navigateTo('Dashboard'); 
        } catch (e) {
            console.error(e);
            alert("Failed to save: " + e.message);
        } finally { setLoading(false); }
    };

    return (
        <div className="form-container" style={{maxWidth: '500px'}}>
            <h2>Edit Profile</h2>
            
            <div style={{marginBottom: '20px', textAlign: 'center'}}>
                <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>Profile Picture</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <label>Skills (Comma separated)</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="input-field" placeholder="React, Node, Design" />
            
            <label>Interests (Comma separated)</label>
            <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} className="input-field" placeholder="AI, Gaming" />
            
            <label>Weekly Availability (Hours)</label>
            <input type="number" value={availabilityHours} onChange={(e) => setAvailabilityHours(e.target.value)} className="input-field" />
            
            <button onClick={handleSave} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
                {loading ? "Saving..." : "Save Profile"}
            </button>
            <button onClick={() => navigateTo('Dashboard')} className="btn" style={{ width: '100%', marginTop: '10px', background:'#eee', color:'black' }}>Cancel</button>
        </div>
    );
}

export default CompleteProfileScreen;