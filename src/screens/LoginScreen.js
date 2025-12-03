// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { signIn, getCurrentUser } from 'aws-amplify/auth';

function LoginScreen({ navigateTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1) Check if a user is already signed in
      try {
        const current = await getCurrentUser();
        const currentEmail =
          current?.signInDetails?.loginId || current?.username;

        console.log('Existing session:', current);

        if (
          currentEmail &&
          currentEmail.toLowerCase() === email.toLowerCase()
        ) {
          // Already logged in as this user → go straight to Dashboard
          navigateTo('Dashboard');
          return;
        }
        // If logged in as someone else, we fall through and call signIn below
      } catch (e) {
        // No existing session, continue to signIn
        console.log('No existing session, proceeding to signIn');
      }

      // 2) Actually sign in
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
      <p className="text-muted" style={{ marginTop: -4, marginBottom: 16 }}>
        Access your groups, tasks, and analytics dashboard.
      </p>

      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input
          type="email"
          className="input-field"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: 8 }}
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: '0.9rem' }}>
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => navigateTo('Signup')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

export default LoginScreen;
