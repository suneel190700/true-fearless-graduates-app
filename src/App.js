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

function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [routeParams, setRouteParams] = useState({});
  const [user, setUser] = useState(null);

  const navigateTo = (screenName, params = {}) => {
    setRouteParams(params);
    setCurrentScreen(screenName);
  };

  // 🔁 Refresh current user whenever the screen changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const current = await getCurrentUser();
        console.log('User is logged in:', current);
        setUser(current);
      } catch (err) {
        console.log('No user logged in');
        setUser(null);
      }
    };

    fetchUser();
  }, [currentScreen]);

  const getDisplayEmail = () => {
    if (!user) return 'Not signed in';
    return (
      user?.signInDetails?.loginId ||
      user?.username ||
      'Unknown user'
    );
  };

  const getDisplayName = () => {
    const email = getDisplayEmail();
    if (!user || !email || email === 'Not signed in') return 'Guest';
    const atIndex = email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : email;
  };

  const displayName = getDisplayName();
  const displayEmail = getDisplayEmail();
  const userInitial = displayName.charAt(0).toUpperCase();

  let ScreenComponent;
  switch (currentScreen) {
    case 'Login':
      ScreenComponent = LoginScreen;
      break;
    case 'Signup':
      ScreenComponent = SignupScreen;
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
    case 'GroupTasks':
      ScreenComponent = GroupTasksScreen;
      break;
    case 'MatchScreen':
      ScreenComponent = MatchScreen;
      break;
    case 'ProfileViewer':
      ScreenComponent = ProfileViewerScreen;
      break;
    case 'Analytics':
      ScreenComponent = AnalyticsScreen;
      break;
    case 'CompleteProfile':
      ScreenComponent = CompleteProfileScreen;
      break;
    default:
      ScreenComponent = LoginScreen;
  }

  // No sidebar for auth screens
  const isAuthScreen = currentScreen === 'Login' || currentScreen === 'Signup';

  if (isAuthScreen) {
    return (
      <div className="App auth-shell">
        <ScreenComponent
          navigateTo={navigateTo}
          route={{ params: routeParams }}
        />
      </div>
    );
  }

  return (
    <div className="App app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo-circle">TF</div>
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-title">TrueFearless</div>
            <div className="sidebar-logo-subtitle">Student Hub</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={currentScreen === 'Dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigateTo('Dashboard')}
          >
            <span role="img" aria-label="dashboard">🏠</span>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={currentScreen === 'CreateGroup' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigateTo('CreateGroup')}
          >
            <span role="img" aria-label="group">📂</span>
            <span>Create Group</span>
          </button>

          <button
            type="button"
            className={currentScreen === 'MatchScreen' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigateTo('MatchScreen')}
          >
            <span role="img" aria-label="match">🤝</span>
            <span>Matching</span>
          </button>

          <button
            type="button"
            className={currentScreen === 'Analytics' ? 'nav-item active' : 'nav-item'}
            onClick={() => navigateTo('Analytics')}
          >
            <span role="img" aria-label="analytics">📊</span>
            <span>Analytics</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">
            <span>{userInitial}</span>
          </div>
          <div className="sidebar-user-text">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-email">{displayEmail}</div>
          </div>
          <button
            type="button"
            className="sidebar-edit-profile"
            onClick={() => navigateTo('CompleteProfile')}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <ScreenComponent
          navigateTo={navigateTo}
          route={{ params: routeParams }}
        />
      </main>
    </div>
  );
}

export default App;
