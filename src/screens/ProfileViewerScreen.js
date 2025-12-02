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
    const candidateId = route.params?.candidateId;
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const client = generateClient();

    useEffect(() => {
        if (candidateId) fetchProfile();
    }, [candidateId]);

    const fetchProfile = async () => {
        try {
            const result = await client.graphql({
                query: getUserQuery,
                variables: { id: candidateId }
            });
            setProfile(result.data.getUser);
        } catch (e) {
            console.error("Error fetching profile", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="form-container" style={{ textAlign: 'center' }}>Loading...</p>;
    if (!profile) return <p className="form-container" style={{ textAlign: 'center' }}>Profile not found.</p>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => navigateTo('MatchScreen')} className="btn" style={{ marginBottom: '20px' }}>
                &larr; Back to Matches
            </button>
            
            <div className="card">
                <h2>{profile.full_name}</h2>
                <p><strong>Email:</strong> {profile.email}</p>
                
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '20px' }}>Skills</h3>
                <p>{profile.skills ? profile.skills.join(', ') : 'None listed'}</p>
                
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '20px' }}>Interests</h3>
                <p>{profile.interests ? profile.interests.join(', ') : 'None listed'}</p>
                
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '5px', marginTop: '20px' }}>Availability</h3>
                <p>{profile.availability_hours || 0} hours per week</p>
            </div>
        </div>
    );
}

export default ProfileViewerScreen;