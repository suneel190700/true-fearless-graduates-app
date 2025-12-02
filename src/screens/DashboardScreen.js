import React, { useState, useEffect } from 'react';
import { signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// GraphQL Query to list all groups
const listGroupsQuery = `
  query ListGroups {
    listGroups {
      items {
        id
        title
        description
        createdAt
        members {
            items {
                user {
                    full_name
                }
            }
        }
      }
    }
  }
`;

function DashboardScreen({ navigateTo }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Default user state (We will update this later to fetch real profile)
    const [user, setUser] = useState({ full_name: 'Student' }); 

    const client = generateClient();

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const groupData = await client.graphql({ query: listGroupsQuery });
            const groupsList = groupData.data.listGroups.items;
            setGroups(groupsList);
        } catch (e) {
            console.error("Error fetching groups:", e);
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATED LOGOUT FUNCTION ---
    const handleLogout = async () => {
        try {
            await signOut(); // Tell AWS to kill the session
            navigateTo('Login'); // Go to Login screen immediately (No reload)
        } catch (error) {
            console.log('error signing out: ', error);
            // If AWS fails, force the user to Login screen anyway
            alert("Logout had an issue, but taking you to login.");
            navigateTo('Login');
        }
    };
    // -------------------------------

    const filteredGroups = groups.filter(group => 
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="app-container">
            {/* Header Section */}
            <header className="page-header">
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>Project Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Welcome back, {user.full_name}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">LOGOUT</button>
            </header>

            {/* Action Toolbar */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button onClick={() => navigateTo('CreateGroup')} className="btn btn-primary">
                    + NEW PROJECT
                </button>
                <button onClick={() => navigateTo('MatchScreen')} className="btn btn-secondary">
                    🔍 FIND TALENT
                </button>
                <button onClick={() => navigateTo('CompleteProfile')} className="btn btn-secondary">
                    ✏️ EDIT PROFILE
                </button>
            </div>
            
            <input 
                type="text" 
                className="input-field" 
                placeholder="Search projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '300px', marginBottom: '20px' }}
            />

            {/* Content Area */}
            {loading ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Loading projects...</p>
            ) : (
                <>
                    {filteredGroups.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                            No active projects found. Start one today!
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