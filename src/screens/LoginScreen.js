// src/screens/LoginScreen.js

import React, { useState } from 'react';
import { signIn, getCurrentUser } from 'aws-amplify/auth';

function LoginScreen({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1) Check if there is already a signed-in user
      try {
        const current = await getCurrentUser();
        const currentEmail =
          current?.signInDetails?.loginId || current?.username;

        console.log('Existing session:', current);

        // If already signed in with the same email, just go to Dashboard
        if (currentEmail && currentEmail.toLowerCase() === email.toLowerCase()) {
          navigateTo('Dashboard');
          return;
        }
        // If signed in as someone else, we fall through and try signIn()
      } catch (e) {
        // No current user / not authenticated → normal login flow
        console.log('No existing session, proceeding to signIn');
      }

      // 2) Actually sign in (only if not already correctly signed in)
      await signIn({ username: email, password });

      const currentAfter = await getCurrentUser();
      console.log('Logged in user:', currentAfter);

      navigateTo('Dashboard');
    } catch (e) {
      console.error('Login error:', e);
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
        {loading ? 'Logging in...' : 'LOG IN'}
      </button>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don&apos;t have an account?{' '}
        <button
          onClick={() => navigateTo('Signup')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default LoginScreen;
