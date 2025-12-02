import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

const listTasksQuery = `
  query ListTasks($filter: ModelTaskFilterInput) {
    listTasks(filter: $filter) {
      items { id title status }
    }
  }
`;

const createTaskMutation = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) { id }
  }
`;

const updateTaskMutation = `
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) { id }
  }
`;

const deleteTaskMutation = `
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input) { id }
  }
`;

function GroupTasksScreen({ navigateTo, route }) {
    const groupId = route.params?.groupId;
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const client = generateClient();

    useEffect(() => { fetchTasks(); }, [groupId]);

    const fetchTasks = async () => {
        const result = await client.graphql({
            query: listTasksQuery,
            variables: { filter: { groupID: { eq: groupId } } }
        });
        setTasks(result.data.listTasks.items);
    };

    const addTask = async () => {
        if (!newTask) return;
        await client.graphql({
            query: createTaskMutation,
            variables: { input: { title: newTask, status: 'pending', groupID: groupId } }
        });
        setNewTask('');
        fetchTasks();
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'done' ? 'pending' : 'done';
        await client.graphql({
            query: updateTaskMutation,
            variables: { input: { id: task.id, status: newStatus } }
        });
        fetchTasks();
    };

    const deleteTask = async (id) => {
        if (!window.confirm("Delete task?")) return;
        await client.graphql({
            query: deleteTaskMutation,
            variables: { input: { id } }
        });
        fetchTasks();
    };

    return (
        <div className="form-container" style={{maxWidth: '800px'}}>
             <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
                <button onClick={() => navigateTo('GroupDetails', { groupId })} className="btn" style={{marginRight: '15px'}}>&larr; Back</button>
                <h2>Tasks</h2>
            </div>

            <div style={{display: 'flex', marginBottom: '20px'}}>
                <input type="text" className="input-field" style={{margin: 0, flex: 1}} value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="New task..." />
                <button onClick={addTask} className="btn btn-primary">Add</button>
            </div>

            {tasks.map(task => (
                <div key={task.id} className="card" style={{padding: '15px', display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                        <h4 style={{margin: 0, textDecoration: task.status === 'done' ? 'line-through' : 'none'}}>{task.title}</h4>
                    </div>
                    <div>
                        <button onClick={() => toggleStatus(task)} className="btn" style={{marginRight: '5px', background: task.status === 'done' ? 'orange' : 'green', color: 'white'}}>
                            {task.status === 'done' ? 'Undo' : 'Done'}
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="btn btn-danger">X</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GroupTasksScreen;