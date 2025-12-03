// src/screens/DashboardScreen.js
import React, { useState, useEffect } from 'react';
import { signOut } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// GraphQL Query to list all groups with members + tasks
const listGroupsQuery = `
  query ListGroups {
    listGroups {
      items {
        id
        title
        description
        createdAt
        members {
          items {
            user {
              id
              full_name
              profilePic
            }
          }
        }
        tasks {
          items {
            id
            status
          }
        }
      }
    }
  }
`;

function DashboardScreen({ navigateTo }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const client = generateClient();

  useEffect(() => {
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGroups = async () => {
    try {
      const groupData = await client.graphql({ query: listGroupsQuery });
      const items = groupData?.data?.listGroups?.items || [];
      setGroups(items);
    } catch (e) {
      console.error('Error fetching groups:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigateTo('Login');
    } catch (error) {
      console.error('error signing out: ', error);
      alert('Logout had an issue, but taking you to login.');
      navigateTo('Login');
    }
  };

  // Derived stats
  const totalProjects = groups.length;
  const totalMembers = groups.reduce((acc, g) => {
    const count = g?.members?.items?.length || 0;
    return acc + count;
  }, 0);
  const totalTasks = groups.reduce((acc, g) => {
    const count = g?.tasks?.items?.length || 0;
    return acc + count;
  }, 0);

  const filteredGroups = groups.filter((group) => {
    const title = group.title || '';
    const desc = group.description || '';
    const q = searchTerm.toLowerCase();
    return (
      title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Project Dashboard</div>
          <div className="page-subtitle">
            Overview of all collaboration spaces, tasks, and members.
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            style={{ background: '#f3f4f6', color: '#111827' }}
            onClick={() => navigateTo('CompleteProfile')}
          >
            ✏️ Edit Profile
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: '#fee2e2', color: '#b91c1c' }}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Top stats + actions */}
      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Active projects</div>
              <div className="card-subtitle">
                Spaces where students are collaborating.
              </div>
            </div>
            <div className="badge">{totalProjects}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Total members</div>
              <div className="card-subtitle">
                Sum of members across all projects.
              </div>
            </div>
            <div className="badge">{totalMembers}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Tasks tracked</div>
              <div className="card-subtitle">
                Combined tasks in every group.
              </div>
            </div>
            <div className="badge">{totalTasks}</div>
          </div>
        </div>
      </div>

      {/* Action toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '18px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigateTo('CreateGroup')}
        >
          + New Project
        </button>
        <button
          type="button"
          className="btn"
          style={{ background: '#eff6ff', color: '#1d4ed8' }}
          onClick={() => navigateTo('MatchScreen')}
        >
          🔍 Find Talent
        </button>

        <div style={{ flex: 1 }} />

        <input
          type="text"
          className="input-field"
          placeholder="Search projects…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            maxWidth: '260px',
            marginBottom: 0,
          }}
        />
      </div>

      {/* Projects grid */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-header" style={{ marginBottom: 10 }}>
          <div>
            <div className="card-title">Projects</div>
            <div className="card-subtitle">
              Click a project to view details, chat, and tasks.
            </div>
          </div>
        </div>

        {loading ? (
          <p
            style={{
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: '24px',
              marginBottom: '12px',
            }}
          >
            Loading projects…
          </p>
        ) : filteredGroups.length === 0 ? (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              marginTop: '24px',
              marginBottom: '12px',
            }}
          >
            No active projects found. Start one today!
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px',
              marginTop: '6px',
            }}
          >
            {filteredGroups.map((group) => {
              const memberItems = group?.members?.items || [];
              const taskItems = group?.tasks?.items || [];
              const openTasks = taskItems.filter(
                (t) => t.status && t.status.toLowerCase() !== 'done'
              ).length;

              return (
                <div
                  key={group.id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigateTo('GroupDetails', { groupId: group.id })
                  }
                >
                  <div className="card-header" style={{ marginBottom: 6 }}>
                    <div>
                      <div
                        className="card-title"
                        style={{ marginBottom: 4 }}
                      >
                        {group.title}
                      </div>
                      <div className="card-subtitle">
                        {group.description || 'No description provided.'}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      marginTop: 8,
                    }}
                  >
                    <span className="text-muted">
                      👥 {memberItems.length} member
                      {memberItems.length === 1 ? '' : 's'}
                    </span>
                    <span className="text-muted">
                      ✅ {taskItems.length} task
                      {taskItems.length === 1 ? '' : 's'} ({openTasks} open)
                    </span>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: 10,
                      paddingTop: 8,
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    📅 Created{' '}
                    {group.createdAt
                      ? new Date(
                          group.createdAt
                        ).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardScreen;
