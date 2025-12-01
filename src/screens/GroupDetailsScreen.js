import React, { useState, useEffect } from 'react';

function GroupDetailsScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // 1. Load User
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    // 2. Fetch Group Details
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

    // 3. Action Handlers
    const handleJoinGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/${groupId}/join`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message);
            }
            alert("Joined successfully!");
            fetchGroupDetails(); 
        } catch (e) { alert(e.message); }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Leave this group?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/${groupId}/leave`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) throw new Error("Failed to leave");
            alert("Left group.");
            navigateTo('Dashboard');
        } catch (e) { alert(e.message); }
    };

    // --- ADDED MISSING FUNCTION HERE ---
    const handleDeleteGroup = async () => {
        if (!window.confirm("Delete your group permanently?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/${groupId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete");
            }
            
            alert("Group deleted.");
            navigateTo('Dashboard');
        } catch (e) { alert(e.message); }
    };

    // ADMIN DELETE HANDLER
    const handleAdminDelete = async () => {
        if (!window.confirm("ADMIN ACTION: Delete this group? This cannot be undone.")) return;

        try {
            const token = localStorage.getItem('token');
            // Ensure this endpoint matches your backend route '/api/groups/admin/:id'
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/admin/${groupId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Admin delete failed");
            }

            alert("Group force-deleted by Admin.");
            navigateTo('Dashboard');
        } catch (e) { alert(e.message); }
    };

    useEffect(() => {
        if (groupId) fetchGroupDetails();
    }, [groupId]);

    if (loading) return <p style={{textAlign:'center', marginTop:'20px'}}>Loading...</p>;
    if (!group) return <p style={{textAlign:'center'}}>Group not found.</p>;

    // 4. Robust Membership Check
    const isMember = group.members?.some(m => String(m.user_id) === String(currentUser?.id));
    const isCreator = String(group.created_by) === String(currentUser?.id);
    const isAdmin = currentUser?.role === 'admin';

    return (
        <div className="form-container" style={{maxWidth: '800px', textAlign: 'left'}}>
            <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginBottom: '20px'}}>&larr; Back</button>

            <h1 style={{borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px'}}>
                {group.title}
                {isAdmin && <span style={{marginLeft: '10px', background:'red', color:'white', padding:'4px 8px', fontSize:'12px', borderRadius:'4px', verticalAlign:'middle'}}>ADMIN</span>}
            </h1>
            <p style={{fontSize: '1.1em'}}>{group.description}</p>
            <p><strong>Created By:</strong> {group.creator_name || 'Unknown'}</p>

            <div className="card">
                <h3>Members ({group.members?.length || 0})</h3>
                <ul>
                    {group.members?.map(m => (
                        <li key={m.user_id} style={{padding: '5px 0', borderBottom: '1px solid #eee'}}>
                            {m.full_name} 
                            {String(m.user_id) === String(group.created_by) && " (Creator)"}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
                {/* 5. Conditional Buttons */}
                {isMember ? (
                    <>
                        <button 
                            className="btn btn-secondary" 
                            style={{marginRight: '15px'}} 
                            onClick={() => navigateTo('GroupChat', { groupId: group.group_id })}
                        >
                            Go to Group Chat
                        </button>
                        <button onClick={handleLeaveGroup} className="btn btn-danger">
                            Leave Group
                        </button>

                        
                        <button 
    className="btn" 
    style={{marginRight: '15px', backgroundColor: '#17a2b8', color: 'white'}} 
    onClick={() => navigateTo('GroupTasks', { groupId: group.group_id })}
>
    📋 Tasks
</button>
                    </>
                ) : (
                    <button onClick={handleJoinGroup} className="btn btn-primary">
                        Join Group
                    </button>
                )}

                {/* Delete Button for Creator */}
                {isCreator && (
                    <button 
                        onClick={handleDeleteGroup} 
                        className="btn btn-danger" 
                        style={{marginTop: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
                    >
                        Delete My Group
                    </button>
                )}

                {/* Delete Button for Admin (if NOT creator) */}
                {isAdmin && !isCreator && (
                     <button 
                        onClick={handleAdminDelete} 
                        className="btn btn-danger" 
                        style={{marginTop: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto', backgroundColor: 'darkred'}}
                    >
                        ⚠️ Admin Force Delete
                    </button>
                )}
            </div>
        </div>
    );
}

export default GroupDetailsScreen;