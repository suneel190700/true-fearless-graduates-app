// src/screens/GroupDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

function GroupDetailsScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const user = auth.currentUser;

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [joining, setJoining] = useState(false);

    // Function to fetch the specific group details
    const fetchGroupDetails = async () => {
        if (!groupId) {
            setError("No Group ID found.");
            setLoading(false);
            return;
        }

        try {
            const groupDocRef = doc(db, "groups", groupId);
            const docSnap = await getDoc(groupDocRef);

            if (docSnap.exists()) {
                const groupData = { id: docSnap.id, ...docSnap.data() };
                setGroup(groupData);
                
                // Check if the current user is already a member
                if (groupData.members && groupData.members.includes(user.uid)) {
                    setIsMember(true);
                }
            } else {
                setError("Group not found.");
            }
        } catch (e) {
            console.error("Error fetching group details:", e);
            setError("Failed to load group details. Check Firestore rules.");
        } finally {
            setLoading(false);
        }
    };
    
    // Function to handle joining the group
    const handleJoinGroup = async () => {
        if (!user) return; 

        setJoining(true);
        setError(null);

        try {
            // Firestore update command: use arrayUnion to safely add the user ID
            const groupDocRef = doc(db, "groups", groupId);
            await updateDoc(groupDocRef, {
                members: arrayUnion(user.uid)
            });

            // Update local state and redirect
            setIsMember(true);
            alert("Success! You have joined the group.");
            
            // Redirect to chat after successful join
            navigateTo('GroupChat', { groupId: group.id });

        } catch (e) {
            console.error("Error joining group:", e);
            setError("Failed to join the group. Check console/rules.");
        } finally {
            setJoining(false);
        }
    };


    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    if (loading) return <p style={{ textAlign: 'center' }}>Loading Group Details...</p>;
    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>Error: {error}</p>;
    if (!group) return <p style={{ textAlign: 'center' }}>Group data unavailable.</p>;


    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
            <button onClick={() => navigateTo('Dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
                &larr; Back to Groups
            </button>
            
            <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>{group.title}</h1>
            
            <p style={{ fontSize: '1.1em', lineHeight: '1.5' }}>{group.description}</p>
            
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <p><strong>Group ID:</strong> {groupId}</p>
                <p><strong>Current Members:</strong> {Array.isArray(group.members) ? group.members.length : 0}</p>
            </div>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                {isMember ? (
                    // 1. If member, show GO TO CHAT button
                    <button
                        onClick={() => navigateTo('GroupChat', { groupId: group.id })}
                        style={{ 
                            padding: '15px 30px', 
                            cursor: 'pointer', 
                            background: 'purple', 
                            color: 'white', 
                            border: 'none',
                            marginRight: '15px' 
                        }}
                    >
                        Go to Group Chat
                    </button>
                ) : (
                    // 2. If NOT member, show JOIN button
                    <button 
                        onClick={handleJoinGroup}
                        disabled={joining}
                        style={{ padding: '15px 30px', cursor: 'pointer', background: 'navy', color: 'white', border: 'none' }}
                    >
                        {joining ? "Joining..." : "Join Group"}
                    </button>
                )}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </div>
        </div>
    );
}

export default GroupDetailsScreen;