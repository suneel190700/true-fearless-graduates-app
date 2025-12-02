import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

// 1. Mutation to create the Group
const createGroupMutation = `
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      title
    }
  }
`;

// 2. Mutation to add the creator as a Member (Link Table)
const createMemberMutation = `
  mutation CreateMember($input: CreateGroupMemberInput!) {
    createGroupMember(input: $input) {
      id
    }
  }
`;

function CreateGroupScreen({ navigateTo }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const client = generateClient();

    const handleCreateGroup = async () => {
        if (!title || !description) return alert("Title and description are required.");
        
        setLoading(true);
        try {
            // A. Get Current User ID
            const { userId } = await getCurrentUser();

            // B. Create the Group
            const groupResult = await client.graphql({
                query: createGroupMutation,
                variables: {
                    input: {
                        title,
                        description,
                        created_by: userId // Store who made it
                    }
                }
            });

            const newGroupId = groupResult.data.createGroup.id;

            // C. Add Creator as a Member
            await client.graphql({
                query: createMemberMutation,
                variables: {
                    input: {
                        groupID: newGroupId,
                        userID: userId
                    }
                }
            });

            console.log("Group Created:", newGroupId);
            navigateTo('Dashboard');

        } catch (e) {
            console.error("Error creating group:", e);
            alert("Failed to create group. See console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{maxWidth: '500px'}}>
            <h2>Start New Project</h2>
            <p>Launch a new initiative.</p>
            
            <label>Project Title</label>
            <input
                type="text"
                placeholder="e.g., AI Research"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
            />
            
            <label>Description</label>
            <textarea
                placeholder="Describe the goals..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="input-field"
            />
            
            <button
                onClick={handleCreateGroup}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '15px' }}
            >
                {loading ? "Creating..." : "Create Group"}
            </button>
            <button
                onClick={() => navigateTo('Dashboard')}
                className="btn"
                style={{ width: '100%', marginTop: '10px', backgroundColor: '#e0e0e0', color: 'black' }}
            >
                Cancel
            </button>
        </div>
    );
}

export default CreateGroupScreen;