import React, { useState, useEffect } from 'react';

function GroupTasksScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch Tasks
    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://tfg-backend-x926.onrender.com/api/tasks/${groupId}`, {
                headers: { 'x-auth-token': token }
            });
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (e) {
            console.error("Error fetching tasks:", e);
        } finally {
            setLoading(false);
        }
    };

    // Add Task
    const addTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://tfg-backend-x926.onrender.com/api/tasks/${groupId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ title: newTaskTitle })
            });
            setNewTaskTitle('');
            fetchTasks();
        } catch (e) { alert("Failed to add task"); }
    };

    // Update Status
    const updateStatus = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://tfg-backend-x926.onrender.com/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ status: newStatus })
            });
            fetchTasks();
        } catch (e) { alert("Failed to update status"); }
    };

    // Delete Task
    const deleteTask = async (taskId) => {
        if(!window.confirm("Delete this task?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://tfg-backend-x926.onrender.com/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            fetchTasks();
        } catch (e) { alert("Failed to delete task"); }
    };

    useEffect(() => {
        if (groupId) fetchTasks();
    }, [groupId]);

    return (
        <div className="form-container" style={{maxWidth: '800px'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                <button onClick={() => navigateTo('GroupDetails', { groupId })} className="btn" style={{marginRight: '15px'}}>
                    &larr; Back
                </button>
                <h2>Project Tasks</h2>
            </div>

            <div style={{display: 'flex', marginBottom: '20px'}}>
                <input 
                    type="text" 
                    className="input-field" 
                    style={{margin: 0, borderRadius: '4px 0 0 4px', flex: 1}} 
                    placeholder="New task..." 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <button onClick={addTask} className="btn btn-primary" style={{borderRadius: '0 4px 4px 0'}}>Add</button>
            </div>

            {loading ? <p>Loading tasks...</p> : (
                tasks.length === 0 ? <p>No tasks yet.</p> : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        {tasks.map(task => (
                            <div key={task.task_id} className="card" style={{padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <h4 style={{margin: '0 0 5px 0'}}>{task.title}</h4>
                                    <small>Status: <strong style={{color: task.status === 'done' ? 'green' : 'orange'}}>{task.status.replace('_', ' ').toUpperCase()}</strong></small>
                                </div>
                                <div style={{display: 'flex', gap: '5px'}}>
                                    {task.status !== 'done' && (
                                        <button onClick={() => updateStatus(task.task_id, 'done')} className="btn" style={{padding: '5px 10px', backgroundColor: '#28a745', color: 'white'}}>✓ Done</button>
                                    )}
                                    <button onClick={() => deleteTask(task.task_id)} className="btn btn-danger" style={{padding: '5px 10px'}}>X</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default GroupTasksScreen;