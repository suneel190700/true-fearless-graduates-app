// src/screens/GroupTasksScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

/* ================================
   QUERIES & MUTATIONS
================================ */

// Get tasks for a specific group (by groupID)
const listTasksQuery = `
  query ListTasks($filter: ModelTaskFilterInput) {
    listTasks(filter: $filter) {
      items {
        id
        title
        description
        status
        createdAt
      }
    }
  }
`;

// Create a new task
const createTaskMutation = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      groupID
      createdAt
    }
  }
`;

// Update task status (or other fields)
const updateTaskMutation = `
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      id
      title
      description
      status
      groupID
      createdAt
    }
  }
`;

// Delete task
const deleteTaskMutation = `
  mutation DeleteTask($input: DeleteTaskInput!) {
    deleteTask(input: $input) {
      id
    }
  }
`;

/* ================================
   COMPONENT
================================ */

function GroupTasksScreen({ navigateTo, route }) {
  const groupId = route?.params?.groupId;
  const groupTitle = route?.params?.title || 'Group';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState('');

  const client = generateClient();

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchTasks = async () => {
    if (!groupId) return;
    setLoading(true);
    setError('');

    try {
      const result = await client.graphql({
        query: listTasksQuery,
        variables: {
          filter: {
            groupID: { eq: groupId },
          },
        },
      });

      let items = result?.data?.listTasks?.items || [];
      items = items.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });

      console.log('[GroupTasks] loaded tasks:', items);
      setTasks(items);
    } catch (e) {
      console.error('[GroupTasks] Error fetching tasks:', e);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !groupId) {
      setError('Please enter a task title.');
      return;
    }

    setError('');
    setCreating(true);

    try {
      const result = await client.graphql({
        query: createTaskMutation,
        variables: {
          input: {
            title: newTitle.trim(),
            description: newDescription.trim() || null,
            status: 'todo',
            groupID: groupId,
          },
        },
      });

      const created = result?.data?.createTask;
      console.log('[GroupTasks] created task:', created);

      setTasks((prev) => [...prev, created]);
      setNewTitle('');
      setNewDescription('');
    } catch (e) {
      console.error('[GroupTasks] Error creating task:', e);
      setError(
        e?.errors?.[0]?.message || e.message || 'Failed to create task.'
      );
    } finally {
      setCreating(false);
    }
  };

  const toggleTaskStatus = async (task) => {
    if (!task?.id) return;

    // simple cycle: todo -> in-progress -> done -> todo
    let nextStatus = 'todo';
    if (task.status === 'todo') nextStatus = 'in-progress';
    else if (task.status === 'in-progress') nextStatus = 'done';
    else if (task.status === 'done') nextStatus = 'todo';

    try {
      const result = await client.graphql({
        query: updateTaskMutation,
        variables: {
          input: {
            id: task.id,
            status: nextStatus,
          },
        },
      });

      const updated = result?.data?.updateTask;
      console.log('[GroupTasks] updated task:', updated);

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (e) {
      console.error('[GroupTasks] Error updating task:', e);
      setError(
        e?.errors?.[0]?.message || e.message || 'Failed to update task.'
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;

    if (!window.confirm('Delete this task?')) {
      return;
    }

    try {
      await client.graphql({
        query: deleteTaskMutation,
        variables: {
          input: { id: taskId },
        },
      });

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e) {
      console.error('[GroupTasks] Error deleting task:', e);
      setError(
        e?.errors?.[0]?.message || e.message || 'Failed to delete task.'
      );
    }
  };

  const statusBadgeStyle = (status) => {
    const base = {
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: '0.7rem',
      fontWeight: 500,
    };
    if (status === 'done') {
      return { ...base, background: '#dcfce7', color: '#166534' };
    }
    if (status === 'in-progress') {
      return { ...base, background: '#dbeafe', color: '#1d4ed8' };
    }
    return { ...base, background: '#fee2e2', color: '#b91c1c' }; // todo
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Tasks · {groupTitle}</div>
          <div className="page-subtitle">
            Track work items for this group and keep everyone aligned.
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            style={{ background: '#f3f4f6', color: '#111827' }}
            onClick={() => navigateTo('GroupDetails', { groupId })}
          >
            ← Back to Group
          </button>
        </div>
      </div>

      {/* Task creation card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header" style={{ marginBottom: 8 }}>
          <div>
            <div className="card-title">Add a new task</div>
            <div className="card-subtitle">
              Break work into small, trackable items.
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateTask}>
          <label style={{ fontWeight: 500 }}>Title</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Draft project proposal"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <label style={{ fontWeight: 500 }}>Description</label>
          <textarea
            className="input-field"
            style={{ minHeight: 60, resize: 'vertical' }}
            placeholder="Optional details, links, or acceptance criteria."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            disabled={creating}
          >
            {creating ? 'Creating…' : 'Add Task'}
          </button>
        </form>
      </div>

      {/* Tasks list card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 6 }}>
          <div>
            <div className="card-title">Task list</div>
            <div className="card-subtitle">
              Click status to cycle through Todo → In progress → Done.
            </div>
          </div>
        </div>

        {loading ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginTop: 18,
            }}
          >
            Loading tasks…
          </p>
        ) : tasks.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginTop: 18,
            }}
          >
            No tasks yet. Start by adding your first one above.
          </p>
        ) : (
          <div
            style={{
              marginTop: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background:
                    task.status === 'done'
                      ? '#f9fafb'
                      : '#ffffff',
                }}
              >
                <div style={{ maxWidth: '70%' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        textDecoration:
                          task.status === 'done' ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    <span style={statusBadgeStyle(task.status)}>
                      {task.status || 'todo'}
                    </span>
                  </div>
                  {task.description && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {task.description}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => toggleTaskStatus(task)}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.8rem',
                      paddingInline: 10,
                    }}
                  >
                    Update status
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleDeleteTask(task.id)}
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      fontSize: '0.8rem',
                      paddingInline: 10,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupTasksScreen;
