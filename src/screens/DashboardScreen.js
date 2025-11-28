import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth'; 
import { auth } from '../firebaseConfig'; 

function DashboardScreen({ navigateTo }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch Groups from Node.js API (PostgreSQL)
    const fetchGroups = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("No session token found. Please log in.");
            }

            const response = await fetch('https://tfg-backend-x926.onrender.com/api/groups', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch groups');
            }

            // Map PostgreSQL snake_case to camelCase for UI
            const mappedGroups = data.map(g => ({
                id: g.group_id,
                title: g.title,
                description: g.description,
                members: [], // Member count handled via SQL query in future optimization
                createdBy: g.created_by,
                createdAt: g.created_at
            }));

            setGroups(mappedGroups);

        } catch (e) {
            console.error("API Error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        signOut(auth).catch(e => console.log(e));
        window.location.reload(); 
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const renderGroupItem = (group) => (
        <div 
            key={group.id} 
            className="card" 
            onClick={() => navigateTo('GroupDetails', { groupId: group.id })}
        >
            <h3>{group.title}</h3>
            <p>{group.description}</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
                **Created:** {new Date(group.createdAt).toLocaleDateString()}
            </p>
        </div>
    );

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Enterprise Dashboard</h2>
            
            {/* Header with action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => navigateTo('CreateGroup')}
                        className="btn btn-primary"
                    >
                        + Start Idea Group
                    </button>
                    
                    {/* Find Teammates Button */}
                    <button
                        onClick={() => navigateTo('MatchScreen')}
                        className="btn btn-secondary"
                    >
                        🔍 Find Teammates
                    </button>
                    
                    {/* Edit Profile Button */}
                    <button
                        onClick={() => navigateTo('CompleteProfile')}
                        className="btn"
                        style={{ backgroundColor: '#e9e9e9', color: 'black' }}
                    >
                        Edit Profile
                    </button>
                </div>
                
                <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                >
                    Logout
                </button>
            </div>
            
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h3>Active Projects ({groups.length})</h3>
                {loading && <p>Loading projects from SQL...</p>}
                {error && <p style={{ color: 'var(--color-danger)' }}>Error: {error}</p>}
                
                {!loading && groups.length === 0 && !error && (
                    <p>No groups found. Be the first to create one!</p>
                )}
                
                {groups.map(renderGroupItem)}
            </div>
        </div>
    );
}

export default DashboardScreen;