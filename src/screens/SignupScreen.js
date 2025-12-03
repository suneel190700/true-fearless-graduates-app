// src/screens/SignupScreen.js
import React, { useState } from 'react';
import {
  signUp,
  confirmSignUp,
  signIn,
  getCurrentUser,
} from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// Create User row in DynamoDB
const createUserMutation = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      full_name
      role
    }
  }
`;

function SignupScreen({ navigateTo }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1 = signup form, 2 = verify

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const client = generateClient();

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: fullName,
          },
        },
      });

      console.log('Signup success:', result);
      setStep(2);
    } catch (e) {
      console.error('Signup error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // A. Confirm sign up in Cognito
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });

      // B. Sign in so we can obtain userId (Cognito sub)
      await signIn({ username: email, password });
      const current = await getCurrentUser();
      const userId = current?.userId;

      console.log('Verified & signed in. userId:', userId);

      // C. Create User profile in DynamoDB with id = userId
      await client.graphql({
        query: createUserMutation,
        variables: {
          input: {
            id: userId,
            email,
            full_name: fullName,
            role: 'student',
          },
        },
      });

      alert('Account verified! You can now log in.');
      navigateTo('Login');
    } catch (e) {
      console.error('Verification error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      handleSignup();
    } else {
      handleVerification();
    }
  };

  return (
    <div className="form-container">
      <h2>{step === 1 ? 'Create Enterprise Account' : 'Verify Your Email'}</h2>

      <p className="text-muted" style={{ marginTop: -4, marginBottom: 12 }}>
        {step === 1
          ? 'Join your learning community and manage groups, tasks, and analytics in one place.'
          : `We sent a verification code to ${email}. Enter it below to activate your account.`}
      </p>

      <form onSubmit={onSubmit}>
        {step === 1 && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Suneel Kalva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

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
          </>
        )}

        {step === 2 && (
          <>
            <label>Verification Code</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter the 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </>
        )}

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
          {loading
            ? step === 1
              ? 'Creating account…'
              : 'Verifying…'
            : step === 1
            ? 'Sign Up'
            : 'Confirm Account'}
        </button>
      </form>

      <p style={{ marginTop: 18, fontSize: '0.9rem' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigateTo('Login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Log In
        </button>
      </p>
    </div>
  );
}

export default SignupScreen;
