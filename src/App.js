import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

// WEEK 1 Screens
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import DashboardScreen from './screens/DashboardScreen';

// WEEK 2/3 Screens
import CreateGroupScreen from './screens/CreateGroupScreen';
import GroupDetailsScreen from './screens/GroupDetailsScreen';
import GroupChatScreen from './screens/GroupChatScreen'; 
import MatchScreen from './screens/MatchScreen';
import ProfileViewerScreen from './screens/ProfileViewerScreen'; 
import GroupTasksScreen from './screens/GroupTasksScreen'; 
import AnalyticsScreen from './screens/AnalyticsScreen'; 

const LoadingScreen = () => <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading... Connecting to AWS</h2>;

function App() {
  const [currentScreen, setCurrentScreen] = useState('Loading');
  const [user, setUser] = useState(null);
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  // NEW: Check AWS for the current user
  async function checkAuth() {
    try {
      const currentUser = await getCurrentUser();
      console.log("User is logged in:", currentUser);
      setUser(currentUser);
      setCurrentScreen('Dashboard');
    } catch (err) {
      console.log("User is not logged in");
      setCurrentScreen('Login');
    }
  }

  const navigateTo = (screenName, params = {}) => {
    setRouteParams(params);
    setCurrentScreen(screenName);
  };

  if (currentScreen === 'Loading') {
      return <LoadingScreen />;
  }
  
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
    case 'MatchScreen':
      ScreenComponent = MatchScreen; 
      break;
    case 'CompleteProfile':
      ScreenComponent = CompleteProfileScreen;
      break;
    case 'GroupTasks': 
      ScreenComponent = GroupTasksScreen;
      break;
    case 'ProfileViewer':
      ScreenComponent = ProfileViewerScreen;
      break;
    case 'Analytics': 
      ScreenComponent = AnalyticsScreen;
      break;
    default:
      ScreenComponent = LoginScreen;
  }

  return (
    <div className="App">
      <ScreenComponent navigateTo={navigateTo} route={{ params: routeParams }} /> 
    </div>
  );
}

export default App;