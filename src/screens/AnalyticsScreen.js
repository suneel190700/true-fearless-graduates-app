import React, { useState, useEffect } from 'react';

function AnalyticsScreen({ navigateTo }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://tfg-backend-x926.onrender.com/api/analytics', {
                    headers: { 'x-auth-token': token }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || "Failed to load analytics");
                }

                const data = await response.json();
                setStats(data);
            } catch (e) {
                console.error("Analytics Error:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="form-container" style={{maxWidth: '900px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '30px'}}>
                <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginRight: '15px'}}>
                    &larr; Back
                </button>
                <h2>Platform Analytics</h2>
            </div>

            {loading ? <p style={{textAlign:'center'}}>Loading data...</p> : error ? (
                <div style={{color: 'red', textAlign: 'center', padding: '20px', border: '1px solid red', borderRadius: '8px'}}>
                    <h3>Access Denied</h3>
                    <p>{error}</p>
                    <small>Only Admins can view this page.</small>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #4e73df'}}>
                            <h4 style={{color: '#4e73df', margin: '0'}}>TOTAL USERS</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.totalUsers}</h1>
                        </div>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #1cc88a'}}>
                            <h4 style={{color: '#1cc88a', margin: '0'}}>GROUPS</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.totalGroups}</h1>
                        </div>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #36b9cc'}}>
                            <h4 style={{color: '#36b9cc', margin: '0'}}>MESSAGES</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.totalMessages}</h1>
                        </div>
                        <div className="card" style={{textAlign: 'center', borderTop: '4px solid #f6c23e'}}>
                            <h4 style={{color: '#f6c23e', margin: '0'}}>TASKS</h4>
                            <h1 style={{fontSize: '3rem', margin: '10px 0'}}>{stats.totalTasks}</h1>
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    <div className="card">
                        <h3>Recent Groups Created</h3>
                        <ul style={{paddingLeft: '20px'}}>
                            {stats.recentGroups.map((group, index) => (
                                <li key={index} style={{marginBottom: '10px'}}>
                                    <strong>{group.title}</strong> 
                                    <span style={{color: '#666', fontSize: '0.9em', marginLeft: '10px'}}>
                                        - {new Date(group.created_at).toLocaleDateString()}
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