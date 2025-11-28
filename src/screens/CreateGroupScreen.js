import React, { useState } from 'react';

function CreateGroupScreen({ navigateTo }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCreateGroup = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError("You must be logged in to create a group.");
            return;
        }
        if (!title || !description) {
            setError("Title and description are required.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Call the Enterprise API
            const response = await fetch('https://tfg-backend-x926.onrender.com/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token // Authenticate with your JWT
                },
                body: JSON.stringify({
                    title: title,
                    description: description
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create group');
            }

            console.log("Group created successfully!", data);
            navigateTo('Dashboard'); 

        } catch (e) {
            console.error("Group creation error:", e.message);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{maxWidth: '500px'}}>
            <h2>Start New Project</h2>
            <p>Launch a new initiative on the Enterprise platform.</p>
            
            <label>Project Title</label>
            <input
                type="text"
                placeholder="e.g., AI Research Initiative"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
            />
            
            <label>Description</label>
            <textarea
                placeholder="Describe the goals and requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="input-field"
            />
            
            {error && <p style={{ color: 'var(--color-danger)', textAlign: 'center' }}>{error}</p>}

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