import React, { useState, useEffect } from 'react';

function GroupDetailsScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Get current user from local storage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    // 1. Fetch Group Details from API
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

            // API returns group object with a 'members' array attached
            setGroup(data); 
        } catch (e) {
            console.error("Error fetching group:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Join Group
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
            fetchGroupDetails(); // Refresh to show updated member list

        } catch (e) {
            alert(e.message);
        }
    };

    // 3. Handle Leave Group
    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/${groupId}/leave`, {
                method: 'POST',
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) throw new Error("Failed to leave group");

            alert("Left group successfully.");
            navigateTo('Dashboard');

        } catch (e) {
            alert(e.message);
        }
    };

    // 4. Handle Delete Group
    const handleDeleteGroup = async () => {
        if (!window.confirm("WARNING: Delete this group permanently?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/groups/${groupId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) throw new Error("Failed to delete group");

            alert("Group deleted.");
            navigateTo('Dashboard');

        } catch (e) {
            alert(e.message);
        }
    };

    useEffect(() => {
        if (groupId) fetchGroupDetails();
    }, [groupId]);

    if (loading) return <p style={{textAlign: 'center', marginTop: '20px'}}>Loading Details...</p>;
    if (error) return <p style={{color: 'red', textAlign: 'center', marginTop: '20px'}}>Error: {error}</p>;
    if (!group) return null;

    // Helper: Check if current user is a member or creator
    const isMember = group.members?.some(m => m.user_id === currentUser?.id);
    const isCreator = group.created_by === currentUser?.id;

    return (
        <div className="form-container" style={{maxWidth: '800px', textAlign: 'left'}}>
            <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginBottom: '20px'}}>
                &larr; Back to Groups
            </button>

            <h1 style={{borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px'}}>
                {group.title}
            </h1>
            <p style={{fontSize: '1.1em', lineHeight: '1.5'}}>{group.description}</p>
            <p><strong>Created By:</strong> {group.creator_name || 'Unknown'}</p>

            <div className="card">
                <h3>Members ({group.members?.length || 0})</h3>
                <ul>
                    {group.members?.map(member => (
                        <li key={member.user_id} style={{padding: '5px 0', borderBottom: '1px solid #eee'}}>
                            {member.full_name} ({member.email})
                            {member.user_id === group.created_by && " (Creator)"}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
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
                    </>
                ) : (
                    <button onClick={handleJoinGroup} className="btn btn-primary">
                        Join Group
                    </button>
                )}

                {isCreator && (
                    <button 
                        onClick={handleDeleteGroup} 
                        className="btn btn-danger" 
                        style={{marginTop: '20px', display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
                    >
                        Delete Group
                    </button>
                )}
            </div>
        </div>
    );
}

export default GroupDetailsScreen;