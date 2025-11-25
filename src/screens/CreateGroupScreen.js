// src/screens/CreateGroupScreen.js
import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc } from "firebase/firestore"; 

function CreateGroupScreen({ navigateTo }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const user = auth.currentUser;
    const isUserLoggedIn = user && user.uid;

    const handleCreateGroup = async () => {
        if (!isUserLoggedIn) {
            setError("You must be logged in to create a group.");
            return;
        }
        if (!title || !description) {
            setError("Title and description are required.");
            return;
        }

        setError(null);
        setLoading(true);

        // Data payload following the structure from the project plan
        const newGroupData = {
            title: title,
            description: description,
            createdBy: user.uid,
            members: [user.uid], // The creator is automatically the first member
            createdAt: new Date().toISOString()
        };

        try {
            // Add a new document to the 'groups' collection
            await addDoc(collection(db, "groups"), newGroupData);

            console.log("Group created successfully!");
            // Redirect back to the dashboard/group list
            navigateTo('Dashboard'); 

        } catch (e) {
            console.error("Group creation error:", e.message);
            setError("Error creating group. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'left', border: '1px solid #eee', borderRadius: '8px' }}>
            <h2>Create a New Idea Group</h2>
            <p>Start a project, hackathon team, or study group!</p>
            
            <label>Group Title</label>
            <input
                type="text"
                placeholder="e.g., AI Chatbot for Students"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: '10px', margin: '5px 0 15px 0', width: '100%', boxSizing: 'border-box' }}
            />
            
            <label>Description (Goals, Skills Needed, etc.)</label>
            <textarea
                placeholder="Describe your idea and the kind of teammates you need."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                style={{ padding: '10px', margin: '5px 0 15px 0', width: '100%', boxSizing: 'border-box' }}
            />
            
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <button
                onClick={handleCreateGroup}
                disabled={loading}
                style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}
            >
                {loading ? "Creating..." : "Create Group"}
            </button>
            <button
                onClick={() => navigateTo('Dashboard')}
                style={{ padding: '10px 20px', width: '100%', cursor: 'pointer', marginTop: '10px', background: '#ccc' }}
            >
                Cancel
            </button>
        </div>
    );
}

export default CreateGroupScreen;