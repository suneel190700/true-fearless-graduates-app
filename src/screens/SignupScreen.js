// src/screens/SignupScreen.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Import our configured auth instance

function SignupScreen({ navigateTo }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Firebase API call to create the user
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Success! Redirect user to the profile screen (Week 1 task)
            console.log("Signup Successful! Redirecting to Complete Profile.");
            navigateTo('CompleteProfile'); // Function passed from App.js

        } catch (e) {
            // Handle Firebase-specific errors
            console.error("Signup error:", e.message);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Create Your Account</h2>

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
                onClick={handleSignup}
                disabled={loading}
                style={{ padding: '10px 20px', width: '100%', cursor: 'pointer' }}
            >
                {loading ? "Signing Up..." : "Sign Up"}
            </button>

            <p style={{ marginTop: '20px' }}>
                Already have an account? 
                <button 
                    onClick={() => navigateTo('Login')} 
                    style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                >
                    Log In
                </button>
            </p>
        </div>
    );
}

export default SignupScreen;