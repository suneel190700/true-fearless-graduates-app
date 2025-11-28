import React, { useState } from 'react';

function SignupScreen({ navigateTo }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // New Field for Enterprise
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !fullName) {
            setError("Please fill in all fields.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // Call the Enterprise API
            const response = await fetch('https://tfg-backend-x926.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    full_name: fullName
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Success!
            console.log("Enterprise Registration Successful:", data);
            alert("Account created! Please log in.");
            navigateTo('Login');

        } catch (e) {
            console.error("Signup error:", e.message);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Create Enterprise Account</h2>

            <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
            />
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
                onClick={handleSignup}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
            >
                {loading ? "Registering..." : "Sign Up"}
            </button>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Already have an account? 
                <button 
                    onClick={() => navigateTo('Login')} 
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Log In
                </button>
            </p>
        </div>
    );
}

export default SignupScreen;