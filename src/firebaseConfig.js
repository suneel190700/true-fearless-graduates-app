// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // <-- NEW IMPORT

// **REPLACE THESE WITH YOUR ACTUAL FIREBASE CONFIGURATION**
const firebaseConfig = {
  apiKey: "AIzaSyAA6RdwfO_XpFGeuy772XbCND9Lm6wFJPc",
  authDomain: "true-fearless-graduates.firebaseapp.com",
  projectId: "true-fearless-graduates",
  storageBucket: "true-fearless-graduates.firebasestorage.app",
  messagingSenderId: "730277957292",
  appId: "1:730277957292:web:5de205a500dd13c924d909",
  measurementId: "G-3RQMEKZS4J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services we need
export const auth = getAuth(app); 
export const db = getFirestore(app);
export const rtdb = getDatabase(app); // <-- NEW EXPORT