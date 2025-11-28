import React, { useState, useEffect } from 'react';

function GroupDetailsScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const fetchGroupDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Please log in.");

            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/${groupId}`, {
                headers: { 'x-auth-token': token }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load group');

            setGroup(data); 
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Standard Join/Leave Handlers (Same as before)
    const handleJoinGroup = async () => { /* ... existing join logic ... */ }; // (Keep your existing join logic here or copy from previous full file if needed for clarity)
    // For brevity in this update, assuming standard join logic exists. 
    // If you need the full file again with Join/Leave logic included, let me know!
    
    // ADMIN DELETE HANDLER
    const handleAdminDelete = async () => {
        if (!window.confirm("ADMIN ACTION: Delete this group? This cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/admin/${groupId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) throw new Error("Admin delete failed");

            alert("Group deleted by Admin Authority.");
            navigateTo('Dashboard');

        } catch (e) {
            alert(e.message);
        }
    };

    // Owner Delete Handler
    const handleDeleteGroup = async () => {
        if (!window.confirm("Delete your group?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://tfg-backend-x926.onrender.com/api/groups/${groupId}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
            navigateTo('Dashboard');
        } catch (e) { alert(e.message); }
    };

    useEffect(() => {
        if (groupId) fetchGroupDetails();
    }, [groupId]);

    if (loading) return <p style={{textAlign:'center', marginTop:'20px'}}>Loading...</p>;
    if (!group) return null;

    const isMember = group.members?.some(m => m.user_id === currentUser?.id);
    const isCreator = group.created_by === currentUser?.id;
    const isAdmin = currentUser?.role === 'admin'; // Check for Admin Role

    return (
        <div className="form-container" style={{maxWidth: '800px', textAlign: 'left'}}>
            <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginBottom: '20px'}}>&larr; Back</button>

            <h1 style={{borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px'}}>{group.title}</h1>
            <p style={{fontSize: '1.1em'}}>{group.description}</p>
            
            {/* Admin Badge */}
            {isAdmin && <span style={{background:'red', color:'white', padding:'2px 6px', fontSize:'10px', borderRadius:'4px', verticalAlign:'middle'}}>ADMIN MODE</span>}

            <div className="card">
                <h3>Members</h3>
                <ul>
                    {group.members?.map(m => <li key={m.user_id}>{m.full_name}</li>)}
                </ul>
            </div>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
                {/* Standard Buttons */}
                {isCreator ? (
                    <button onClick={handleDeleteGroup} className="btn btn-danger">Delete My Group</button>
                ) : (
                    isAdmin && (
                        <button onClick={handleAdminDelete} className="btn btn-danger" style={{backgroundColor: 'darkred'}}>
                            ⚠️ Admin Force Delete
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

export default GroupDetailsScreen;