import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth'; // NEW: Amplify Auth Import

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
            // NEW: Amplify Sign In
            const { isSignedIn, nextStep } = await signIn({ username: email, password });

            if (isSignedIn) {
                console.log("Login Successful");
                // We don't need to manually store tokens anymore; Amplify handles it.
                // Just reload or navigate to Dashboard.
                navigateTo('Dashboard');
                window.location.reload(); 
            } else {
                // Handle cases where MFA or password change might be required (optional for MVP)
                console.log("Next step:", nextStep);
            }

        } catch (e) {
            console.error("Login error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Enterprise Login</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
            />

            {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

            <button
                onClick={handleLogin}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
            >
                {loading ? "Logging In..." : "Log In"}
            </button>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Don't have an account? 
                <button 
                    onClick={() => navigateTo('Signup')} 
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Sign Up
                </button>
            </p>
        </div>
    );
}

export default LoginScreen;