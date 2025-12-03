// src/screens/AnalyticsScreen.js
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';

/* ================================
   QUERY
================================ */

// Single query that asks for counts via list operations
const statsQuery = `
  query GetStats {
    listUsers {
      items { id }
    }
    listGroups {
      items {
        id
        title
        createdAt
      }
    }
    listMessages {
      items { id }
    }
    listTasks {
      items { id }
    }
  }
`;

/* ================================
   COMPONENT
================================ */

function AnalyticsScreen({ navigateTo }) {
  const [stats, setStats] = useState({
    users: 0,
    groups: 0,
    messages: 0,
    tasks: 0,
    recentGroups: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const client = generateClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('');
        setLoading(true);

        const res = await client.graphql({ query: statsQuery });
        const data = res?.data || {};

        const users = data.listUsers?.items || [];
        const groups = data.listGroups?.items || [];
        const messages = data.listMessages?.items || [];
        const tasks = data.listTasks?.items || [];

        // Sort groups by createdAt desc for "Recent"
        const sortedGroups = [...groups].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });

        setStats({
          users: users.length,
          groups: groups.length,
          messages: messages.length,
          tasks: tasks.length,
          recentGroups: sortedGroups.slice(0, 5),
        });
      } catch (err) {
        console.error('[Analytics] Error fetching stats:', err);
        setError('Failed to load analytics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div className="page-title">Workspace Analytics</div>
          <div className="page-subtitle">
            High-level overview of how your community is using the platform.
          </div>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn"
            style={{ background: '#f3f4f6', color: '#111827' }}
            onClick={() => navigateTo('Dashboard')}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="card-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Registered users</div>
              <div className="card-subtitle">
                Total identities created in this workspace.
              </div>
            </div>
            <div className="badge">{stats.users}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Active groups</div>
              <div className="card-subtitle">
                Collaboration spaces created by members.
              </div>
            </div>
            <div className="badge">{stats.groups}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Messages sent</div>
              <div className="card-subtitle">
                Total chat messages across all groups.
              </div>
            </div>
            <div className="badge">{stats.messages}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Tasks tracked</div>
              <div className="card-subtitle">
                Items in group task boards.
              </div>
            </div>
            <div className="badge">{stats.tasks}</div>
          </div>
        </div>
      </div>

      {/* Detail + recent groups */}
      <div className="card-grid">
        {/* Left: tiny narrative / insights */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 6 }}>
            <div>
              <div className="card-title">Usage snapshot</div>
              <div className="card-subtitle">
                A quick summary of how activity is distributed.
              </div>
            </div>
          </div>

          {loading ? (
            <p
              style={{
                marginTop: 10,
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Crunching numbers…
            </p>
          ) : error ? (
            <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
              {error}
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'disc',
                paddingLeft: '20px',
                marginTop: 8,
                fontSize: '0.9rem',
              }}
            >
              <li>
                You currently have <strong>{stats.users}</strong> registered
                user{stats.users === 1 ? '' : 's'} in the system.
              </li>
              <li>
                Those users are collaborating in{' '}
                <strong>{stats.groups}</strong> active group
                {stats.groups === 1 ? '' : 's'}.
              </li>
              <li>
                Together, they&apos;ve exchanged{' '}
                <strong>{stats.messages}</strong> message
                {stats.messages === 1 ? '' : 's'}.
              </li>
              <li>
                You&apos;re tracking{' '}
                <strong>{stats.tasks}</strong> task
                {stats.tasks === 1 ? '' : 's'} across all boards.
              </li>
            </ul>
          )}
        </div>

        {/* Right: Recent groups list */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 6 }}>
            <div>
              <div className="card-title">Recently created groups</div>
              <div className="card-subtitle">
                The latest spaces your members have set up.
              </div>
            </div>
          </div>

          {loading ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: 16,
              }}
            >
              Loading groups…
            </p>
          ) : stats.recentGroups.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                marginTop: 16,
              }}
            >
              No groups found yet. Encourage members to create their first project!
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                paddingLeft: 0,
                marginTop: 6,
              }}
            >
              {stats.recentGroups.map((g) => (
                <li
                  key={g.id}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: '0.95rem',
                      }}
                    >
                      {g.title || 'Untitled group'}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Created{' '}
                      {g.createdAt
                        ? new Date(g.createdAt).toLocaleString()
                        : 'Unknown date'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                    }}
                    onClick={() =>
                      navigateTo('GroupDetails', { groupId: g.id })
                    }
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsScreen;
