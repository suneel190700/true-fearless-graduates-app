// src/App.js
import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

// Screens
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateGroupScreen from './screens/CreateGroupScreen';
import GroupDetailsScreen from './screens/GroupDetailsScreen';
import GroupChatScreen from './screens/GroupChatScreen';
import MatchScreen from './screens/MatchScreen';
import ProfileViewerScreen from './screens/ProfileViewerScreen';
import GroupTasksScreen from './screens/GroupTasksScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';

import './App.css';

function App() {
  const [screen, setScreen] = useState('Login');
  const [routeParams, setRouteParams] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Simple navigation helper passed to all screens
  const navigateTo = (name, params = {}) => {
    setScreen(name);
    setRouteParams(params || {});
  };

  // On first load, check if user is already signed in
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await getCurrentUser();
        console.log('User is logged in:', user);
        setCurrentUser(user);
        setScreen('Dashboard');
      } catch (e) {
        console.log('No existing session, staying on Login');
        setCurrentUser(null);
        setScreen('Login');
      } finally {
        setCheckingAuth(false);
      }
    };

    initAuth();
  }, []);

  if (checkingAuth) {
    return (
      <div className="app-splash">
        <div className="app-splash-card">
          <div className="app-logo-circle">TF</div>
          <p>Loading your workspace…</p>
        </div>
      </div>
    );
  }

  // Choose which screen component to render
  let ScreenComponent;
  switch (screen) {
    case 'Signup':
      ScreenComponent = SignupScreen;
      break;
    case 'Login':
      ScreenComponent = LoginScreen;
      break;
    case 'CompleteProfile':
      ScreenComponent = CompleteProfileScreen;
      break;
    case 'Dashboard':
      ScreenComponent = DashboardScreen;
      break;
    case 'CreateGroup':
      ScreenComponent = CreateGroupScreen;
      break;
    case 'GroupDetails':
      ScreenComponent = GroupDetailsScreen;
      break;
    case 'GroupChat':
      ScreenComponent = GroupChatScreen;
      break;
    case 'Match':
      ScreenComponent = MatchScreen;
      break;
    case 'ProfileViewer':
      ScreenComponent = ProfileViewerScreen;
      break;
    case 'GroupTasks':
      ScreenComponent = GroupTasksScreen;
      break;
    case 'Analytics':
      ScreenComponent = AnalyticsScreen;
      break;
    default:
      ScreenComponent = LoginScreen;
  }

  const isAuthScreen = screen === 'Login' || screen === 'Signup';

  return (
    <div className="App">
      {isAuthScreen ? (
        // Centered card layout for Login / Signup
        <div className="auth-shell">
          <ScreenComponent
            navigateTo={navigateTo}
            route={{ params: routeParams }}
          />
        </div>
      ) : (
        // Main app shell with sidebar + content
        <div className="app-shell">
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="app-logo-circle small">TF</div>
              <div>
                <div className="sidebar-title">TrueFearless</div>
                <div className="sidebar-subtitle">Student Hub</div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <button
                className={`sidebar-link ${
                  screen === 'Dashboard' ? 'active' : ''
                }`}
                onClick={() => navigateTo('Dashboard')}
              >
                🏠 Dashboard
              </button>
              <button
                className={`sidebar-link ${
                  screen === 'CreateGroup' ? 'active' : ''
                }`}
                onClick={() => navigateTo('CreateGroup')}
              >
                ➕ Create Group
              </button>
              <button
                className={`sidebar-link ${
                  screen === 'Match' ? 'active' : ''
                }`}
                onClick={() => navigateTo('Match')}
              >
                🤝 Matching
              </button>
              <button
                className={`sidebar-link ${
                  screen === 'Analytics' ? 'active' : ''
                }`}
                onClick={() => navigateTo('Analytics')}
              >
                📊 Analytics
              </button>
            </nav>

            <div className="sidebar-footer">
              {currentUser && (
                <div className="user-pill">
                  <div className="user-avatar">
                    {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-meta">
                    <div className="user-name">
                      {currentUser?.username?.split('@')[0]}
                    </div>
                    <div className="user-email">
                      {currentUser?.username}
                    </div>
                  </div>
                </div>
              )}
              <button
                className="sidebar-link subtle"
                onClick={() => navigateTo('CompleteProfile')}
              >
                ✏️ Edit Profile
              </button>
            </div>
          </aside>

          <main className="main-content">
            <ScreenComponent
              navigateTo={navigateTo}
              route={{ params: routeParams }}
            />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
