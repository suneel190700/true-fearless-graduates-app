import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

// Simple queries to get lists (Amplify returns limited batches, but fine for MVP)
const statsQuery = `
  query GetStats {
    listUsers { items { id } }
    listGroups { items { id title createdAt } }
    listMessages { items { id } }
    listTasks { items { id } }
  }
`;

function AnalyticsScreen({ navigateTo }) {
    const [stats, setStats] = useState({ users: 0, groups: 0, messages: 0, tasks: 0, recentGroups: [] });
    const [loading, setLoading] = useState(true);
    const client = generateClient();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Run one big query to get data lists
            const result = await client.graphql({ query: statsQuery });
            
            const users = result.data.listUsers.items.length;
            const groupsList = result.data.listGroups.items;
            const messages = result.data.listMessages.items.length;
            const tasks = result.data.listTasks.items.length;

            // Sort groups by date to find recent ones
            const recent = groupsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

            setStats({
                users,
                groups: groupsList.length,
                messages,
                tasks,
                recentGroups: recent
            });
        } catch (e) {
            console.error("Analytics Error", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{maxWidth: '900px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '30px'}}>
                <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginRight: '15px'}}>&larr; Back</button>
                <h2>Platform Analytics</h2>
            </div>

            {loading ? <p style={{textAlign:'center'}}>Loading data...</p> : (
                <>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #4e73df'}}>
                            <h4 style={{color: '#4e73df', margin: '0'}}>TOTAL USERS</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.users}</h1>
                        </div>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #1cc88a'}}>
                            <h4 style={{color: '#1cc88a', margin: '0'}}>GROUPS</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.groups}</h1>
                        </div>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #36b9cc'}}>
                            <h4 style={{color: '#36b9cc', margin: '0'}}>MESSAGES</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.messages}</h1>
                        </div>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #f6c23e'}}>
                            <h4 style={{color: '#f6c23e', margin: '0'}}>TASKS</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.tasks}</h1>
                        </div>
                    </div>

                    <div className="card">
                        <h3>Recent Groups Created</h3>
                        <ul style={{paddingLeft: '20px'}}>
                            {stats.recentGroups.map((group) => (
                                <li key={group.id} style={{marginBottom: '10px'}}>
                                    <strong>{group.title}</strong> 
                                    <span style={{color: '#666', fontSize: '0.9em', marginLeft: '10px'}}>
                                        - {new Date(group.createdAt).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

export default AnalyticsScreen;