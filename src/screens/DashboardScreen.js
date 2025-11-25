// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; // Import Firestore (db) and Auth (auth)
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { signOut } from 'firebase/auth'; // Function to handle logging out

function DashboardScreen({ navigateTo }) {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to fetch groups from Firestore
    const fetchGroups = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all documents in the 'groups' collection, ordered by creation time
            const groupsCollectionRef = collection(db, "groups");
            const q = query(groupsCollectionRef, orderBy("createdAt", "desc"));
            
            const querySnapshot = await getDocs(q);
            
            // Map the documents to an array of group objects, including the document ID
            const fetchedGroups = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setGroups(fetchedGroups);

        } catch (e) {
            // This error often catches permission/rule issues or network problems
            console.error("Error fetching groups:", e);
            setError("Failed to load groups. Check Firestore Rules for 'read' access on the 'groups' collection.");
        } finally {
            setLoading(false);
        }
    };

    // Logout Function
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User signed out successfully. App.js listener will redirect.");
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Error logging out. Check console.");
        }
    };

    // Fetch groups when the component first loads
    useEffect(() => {
        fetchGroups();
    }, []);


    // Component helper function to render a single group item (Week 2 logic)
    const renderGroupItem = (group) => {
        // Safe access for members array and other fields
        const memberCount = Array.isArray(group.members) ? group.members.length : 0;

        return (
            <div 
                key={group.id} 
                style={{ 
                    border: '1px solid #ddd', 
                    padding: '15px', 
                    marginBottom: '10px', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    textAlign: 'left'
                }}
                // Navigate to the GroupDetails screen, passing the group's ID
                onClick={() => navigateTo('GroupDetails', { groupId: group.id })}
            >
                <h3>{group.title || 'Untitled Group'}</h3>
                <p>{group.description || 'No description provided.'}</p>
                <p style={{ fontSize: '0.9em', color: '#666' }}>
                    **Members:** {memberCount} | 
                    **Created:** {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
                </p>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Welcome Back!</h2>
            
            {/* Header with action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <button
                    onClick={() => navigateTo('CreateGroup')}
                    style={{ padding: '10px 20px', cursor: 'pointer', background: 'green', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px' }}
                >
                    + Start a New Idea Group
                </button>
                
                {/* NEW BUTTON FOR MATCHING (Week 3 Integration) */}
                <button
                    onClick={() => navigateTo('MatchScreen')}
                    style={{ padding: '10px 20px', cursor: 'pointer', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', marginRight: 'auto' }}
                >
                    🔍 Find Teammates
                </button>

                <button
                    onClick={handleLogout}
                    style={{ padding: '10px 20px', cursor: 'pointer', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Logout
                </button>
            </div>
            
            {/* Group Listing Area */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <h3>Browse Idea Groups ({groups.length})</h3>
                {loading && <p>Loading groups...</p>}
                {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                
                {!loading && groups.length === 0 && !error && (
                    <p>No groups found. Be the first to create one!</p>
                )}
                
                {/* Render the list of groups */}
                {groups.map(renderGroupItem)}
            </div>
        </div>
    );
}

export default DashboardScreen;