import React, { useState } from 'react';

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
            // Call the Enterprise API
            const response = await fetch('https://tfg-backend-x926.onrender.com/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Success! Save the Token
            console.log("Login Successful:", data);
            
            // Store the token and user info in browser storage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Force a page reload to update App.js state (Simple method for now)
            window.location.reload(); 

        } catch (e) {
            console.error("Login error:", e.message);
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