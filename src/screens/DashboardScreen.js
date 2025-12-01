import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth'; 
import { auth } from '../firebaseConfig'; 

function DashboardScreen({ navigateTo }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("No session token found. Please log in.");

            const response = await fetch('https://tfg-backend-x926.onrender.com/api/groups', {
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                const data = await response.json();
                const mappedGroups = data.map(g => ({
                    id: g.group_id,
                    title: g.title,
                    description: g.description,
                    createdAt: g.created_at
                }));
                setGroups(mappedGroups);
            } else {
                throw new Error('Failed to fetch groups');
            }
        } catch (e) {
            console.error("API Error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        signOut(auth).catch(console.error);
        window.location.reload(); 
    };

    const filteredGroups = groups.filter(group => 
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container">
            {/* Header Section */}
            <header className="page-header">
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>Enterprise Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Welcome back, {user?.full_name || 'Student'}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </header>

            {/* Action Toolbar */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => navigateTo('CreateGroup')} className="btn btn-primary">
                    + New Project
                </button>
                <button onClick={() => navigateTo('MatchScreen')} className="btn btn-secondary">
                    🔍 Find Talent
                </button>
                <button onClick={() => navigateTo('CompleteProfile')} className="btn btn-secondary">
                    ✏️ Edit Profile
                </button>
                {/* Admin/Analytics Button (Visible to all for now, protected by backend) */}
                <button onClick={() => navigateTo('Analytics')} className="btn btn-secondary">
                    📊 Analytics
                </button>
                
                <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Search projects..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '300px', margin: 0, marginLeft: 'auto' }}
                />
            </div>

            {/* Content Area */}
            {loading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Loading projects...</p>
            ) : error ? (
                <p style={{ color: 'var(--danger)', textAlign: 'center' }}>Error: {error}</p>
            ) : (
                <>
                    {filteredGroups.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            {searchTerm ? "No projects match your search." : "No active projects found. Start one today!"}
                        </p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {filteredGroups.map(group => (
                                <div 
                                    key={group.id} 
                                    className="card" 
                                    onClick={() => navigateTo('GroupDetails', { groupId: group.id })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-accent)' }}>{group.title}</h3>
                                        <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>→</span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.5', height: '45px', overflow: 'hidden', margin: '0 0 15px 0' }}>
                                        {group.description}
                                    </p>
                                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        📅 Created {new Date(group.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default DashboardScreen;