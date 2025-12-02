import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

// QUERIES & MUTATIONS
const getGroupQuery = `
  query GetGroup($id: ID!) {
    getGroup(id: $id) {
      id
      title
      description
      created_by
      members {
        items {
          id
          userID
          user {
            id
            full_name
            email
          }
        }
      }
    }
  }
`;

const createMemberMutation = `
  mutation CreateMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) { id }
  }
`;

const deleteMemberMutation = `
  mutation DeleteMember($input: DeleteGroupMemberInput!) {
    deleteGroupMember(input: $input) { id }
  }
`;

const deleteGroupMutation = `
  mutation DeleteGroup($input: DeleteGroupInput!) {
    deleteGroup(input: $input) { id }
  }
`;

function GroupDetailsScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const client = generateClient();

    useEffect(() => {
        const init = async () => {
            try {
                const user = await getCurrentUser();
                console.log("Current User:", user); // DEBUG LOG
                setCurrentUser(user);
                fetchGroupDetails();
            } catch (e) {
                console.error("Auth Error", e);
            }
        };
        init();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            const result = await client.graphql({
                query: getGroupQuery,
                variables: { id: groupId }
            });
            setGroup(result.data.getGroup);
        } catch (e) {
            console.error("Error loading group", e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!currentUser || !currentUser.userId) {
            alert("Error: User ID not found. Please log out and back in.");
            return;
        }

        try {
            console.log("Attempting to join group:", groupId, "as user:", currentUser.userId);
            
            await client.graphql({
                query: createMemberMutation,
                variables: {
                    input: { 
                        groupID: groupId, 
                        userID: currentUser.userId 
                    }
                }
            });
            
            alert("Joined successfully!");
            // Refresh page data immediately
            fetchGroupDetails();
        } catch (e) { 
            console.error("Join Error Detailed:", e);
            // Show the actual error message from AWS
            alert("Error joining group: " + (e.errors?.[0]?.message || e.message)); 
        }
    };

    const handleLeave = async () => {
        if (!window.confirm("Leave this group?")) return;
        try {
            // Find the membership ID first
            const membership = group.members.items.find(m => m.userID === currentUser.userId);
            if (!membership) {
                alert("Membership not found (already left?)");
                return;
            }

            await client.graphql({
                query: deleteMemberMutation,
                variables: { input: { id: membership.id } }
            });
            alert("Left group.");
            navigateTo('Dashboard');
        } catch (e) { alert("Error leaving group"); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this group permanently?")) return;
        try {
            await client.graphql({
                query: deleteGroupMutation,
                variables: { input: { id: groupId } }
            });
            navigateTo('Dashboard');
        } catch (e) { alert("Error deleting group"); }
    };

    if (loading) return <p style={{textAlign:'center', marginTop: '50px'}}>Loading Group...</p>;
    if (!group) return <p style={{textAlign:'center', marginTop: '50px'}}>Group not found.</p>;

    // Robust check for membership
    const isMember = group.members?.items?.some(m => m.userID === currentUser?.userId);
    const isCreator = group.created_by === currentUser?.userId;

    return (
        <div className="form-container" style={{maxWidth: '800px', textAlign: 'left'}}>
            <button onClick={() => navigateTo('Dashboard')} className="btn" style={{marginBottom: '20px'}}>&larr; Back</button>

            <h1 style={{borderBottom: '2px solid var(--color-primary)', paddingBottom: '10px'}}>{group.title}</h1>
            <p style={{fontSize: '1.1em'}}>{group.description}</p>

            <div className="card">
                <h3>Members ({group.members?.items?.length || 0})</h3>
                <ul>
                    {group.members?.items?.length === 0 && <li style={{color: '#888'}}>No members yet. Be the first to join!</li>}
                    {group.members?.items?.map(m => (
                        <li key={m.id} style={{padding: '5px 0', borderBottom: '1px solid #eee'}}>
                            {m.user ? m.user.full_name : "Unknown User"} 
                            {m.userID === group.created_by && " (Creator)"}
                        </li>
                    ))}
                </ul>
            </div>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
                {/* Logic: If you are a member, show Chat/Tasks. If not, show Join. */}
                {isMember ? (
                    <>
                        <button className="btn btn-secondary" style={{marginRight: '15px'}} onClick={() => navigateTo('GroupChat', { groupId })}>
                            💬 Chat
                        </button>
                        <button className="btn" style={{marginRight: '15px', backgroundColor: '#17a2b8', color: 'white'}} onClick={() => navigateTo('GroupTasks', { groupId })}>
                            📋 Tasks
                        </button>
                        
                        {/* Only show Leave if you are NOT the creator (Creators usually delete instead of leave) */}
                        {!isCreator && <button onClick={handleLeave} className="btn btn-danger">Leave</button>}
                    </>
                ) : (
                    <button onClick={handleJoin} className="btn btn-primary">
                        Join Group
                    </button>
                )}

                {/* Creator Actions */}
                {isCreator && (
                    <div style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px'}}>
                        <p style={{fontSize: '0.9em', color: '#666'}}>Owner Actions</p>
                        <button onClick={handleDelete} className="btn btn-danger">
                            Delete My Group
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GroupDetailsScreen;