// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Import our configured auth instance

function LoginScreen({ navigateTo }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Firebase API call to sign the user in
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Success! Redirect user to the dashboard or profile check
            console.log("Login Successful! Redirecting to Dashboard.");
            navigateTo('Dashboard'); // Function passed from App.js

        } catch (e) {
            // Handle Firebase-specific errors
            console.error("Login error:", e.message);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Log In to Your Account</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '10px', margin: '10px 0', width: '100%' }}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: '10px', margin: '10px 0', width: '100%' }}
            />

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button
                onClick={handleLogin}
                disabled={loading}
                style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}
            >
                {loading ? "Logging In..." : "Log In"}
            </button>

            <p style={{ marginTop: '20px' }}>
                Don't have an account? 
                <button 
                    onClick={() => navigateTo('Signup')} 
                    style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                >
                    Sign Up
                </button>
            </p>
        </div>
    );
}

export default LoginScreen;