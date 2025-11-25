// src/App.js (CORRECTED CODE)
import React, { useState, useEffect } from 'react';
// WEEK 1 Screens
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import DashboardScreen from './screens/DashboardScreen';
// WEEK 2/3 Screens
import CreateGroupScreen from './screens/CreateGroupScreen';
import GroupChatScreen from './screens/GroupChatScreen'; 
import GroupDetailsScreen from './screens/GroupDetailsScreen'; 

// Import the FULL MatchScreen component (assuming you completed the logic in MatchScreen.js)
import MatchScreen from './screens/MatchScreen'; 


// Firebase Imports
import { auth, db } from './firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Placeholder Screens
const LoadingScreen = () => <h2>Loading... Checking Authentication Status</h2>;


function App() {
  const [currentScreen, setCurrentScreen] = useState('Loading');
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [routeParams, setRouteParams] = useState({});

  // Function to check if the user has completed their profile in Firestore
  const checkProfileStatus = async (user) => {
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().skills && docSnap.data().skills.length > 0) {
        setCurrentScreen('Dashboard');
      } else {
        setCurrentScreen('CompleteProfile');
      }
    } catch (e) {
        console.error("Profile check failed (check Firestore rules):", e);
        setCurrentScreen('CompleteProfile'); 
    }
    setLoadingAuth(false);
  };

  // Firebase Authentication Listener 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkProfileStatus(currentUser); 
      } else {
        setCurrentScreen('Signup');
        setLoadingAuth(false);
      }
    });
    return unsubscribe; 
  }, []);

  // Universal navigation function
  const navigateTo = (screenName, params = {}) => {
    setRouteParams(params);
    setCurrentScreen(screenName);
  };

  if (loadingAuth || currentScreen === 'Loading') {
      return <LoadingScreen />;
  }
  
  // Dynamic screen selection based on currentScreen state
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
    case 'MatchScreen': // <--- CORRECT, SINGLE CASE FOR MATCH SCREEN
      ScreenComponent = MatchScreen; 
      break;
    case 'Signup':
    default:
      ScreenComponent = SignupScreen;
  }

  return (
    <div className="App">
      {/* Pass the routing function and any parameters to the current screen */}
      <ScreenComponent navigateTo={navigateTo} route={{ params: routeParams }} /> 
    </div>
  );
}

export default App;