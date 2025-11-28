import React, { useState, useEffect } from 'react';
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

const LoadingScreen = () => <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading... Checking Enterprise Session</h2>;

function App() {
  const [currentScreen, setCurrentScreen] = useState('Loading');
  const [user, setUser] = useState(null); // Stores the User Object
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    // Check for Enterprise Token in Local Storage instead of Firebase
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        // If user exists, go to Dashboard (We will build a SQL Profile check later)
        setCurrentScreen('Dashboard');
    } else {
        setCurrentScreen('Signup');
    }
    setLoadingAuth(false);
  }, []);

  const navigateTo = (screenName, params = {}) => {
    setRouteParams(params);
    setCurrentScreen(screenName);
  };

  if (loadingAuth || currentScreen === 'Loading') {
      return <LoadingScreen />;
  }
  
  let ScreenComponent;
  switch (currentScreen) {
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
    case 'MatchScreen':
      ScreenComponent = MatchScreen; 
      break;
    case 'ProfileViewer':
      ScreenComponent = ProfileViewerScreen;
      break;
    case 'Signup':
    default:
      ScreenComponent = SignupScreen;
  }

  return (
    <div className="App">
      <ScreenComponent navigateTo={navigateTo} route={{ params: routeParams }} /> 
    </div>
  );
}

export default App;