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

  const tasksByStatus = {
    todo: tasks.filter((t) => (t.status || 'todo') === 'todo'),
    inProgress: tasks.filter((t) => t.status === 'in-progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const renderTaskCard = (task) => (
    <div
      key={task.id}
      style={{
        padding: '8px 10px',
        borderRadius: 10,
        border: '1px solid var(--border-subtle)',
        background: '#ffffff',
        marginBottom: 6,
        boxShadow: '0 4px 10px rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: '0.9rem',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </span>
        <span style={statusBadgeStyle(task.status || 'todo')}>
          {task.status || 'todo'}
        </span>
      </div>
      {task.description && (
        <div
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}
        >
          {task.description}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          className="btn"
          onClick={() => toggleTaskStatus(task)}
          style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            fontSize: '0.78rem',
            paddingInline: 10,
          }}
        >
          Next status
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => handleDeleteTask(task.id)}
          style={{
            background: '#fee2e2',
            color: '#b91c1c',
            fontSize: '0.78rem',
            paddingInline: 10,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Tasks · {groupTitle}</div>
          <div className="page-subtitle">
            Kanban-style board: move work from Todo → In progress → Done.
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

      {/* Kanban Board */}
      <div className="card-grid">
        {/* Todo column */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 6 }}>
            <div>
              <div className="card-title">Todo</div>
              <div className="card-subtitle">
                Backlog items waiting to be picked up.
              </div>
            </div>
            <div className="badge">
              {tasksByStatus.todo.length} item
              {tasksByStatus.todo.length === 1 ? '' : 's'}
            </div>
          </div>
          {loading ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: 12,
              }}
            >
              Loading tasks…
            </p>
          ) : tasksByStatus.todo.length === 0 ? (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: 6,
              }}
            >
              Nothing in Todo. Add a task above.
            </p>
          ) : (
            tasksByStatus.todo.map(renderTaskCard)
          )}
        </div>

        {/* In-progress column */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 6 }}>
            <div>
              <div className="card-title">In progress</div>
              <div className="card-subtitle">
                Work currently being done.
              </div>
            </div>
            <div className="badge">
              {tasksByStatus.inProgress.length} item
              {tasksByStatus.inProgress.length === 1 ? '' : 's'}
            </div>
          </div>
          {loading ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: 12,
              }}
            >
              Loading tasks…
            </p>
          ) : tasksByStatus.inProgress.length === 0 ? (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: 6,
              }}
            >
              No tasks in progress yet.
            </p>
          ) : (
            tasksByStatus.inProgress.map(renderTaskCard)
          )}
        </div>

        {/* Done column */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 6 }}>
            <div>
              <div className="card-title">Done</div>
              <div className="card-subtitle">
                Completed work, nice job.
              </div>
            </div>
            <div className="badge">
              {tasksByStatus.done.length} item
              {tasksByStatus.done.length === 1 ? '' : 's'}
            </div>
          </div>
          {loading ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: 12,
              }}
            >
              Loading tasks…
            </p>
          ) : tasksByStatus.done.length === 0 ? (
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginTop: 6,
              }}
            >
              Nothing completed yet. You got this 💪
            </p>
          ) : (
            tasksByStatus.done.map(renderTaskCard)
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupTasksScreen;
