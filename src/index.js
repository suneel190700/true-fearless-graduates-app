import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// --- AWS CONFIGURATION ---
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'; 

Amplify.configure(awsExports);
// -------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();