import React, { useState } from 'react';
import { signUp, confirmSignUp, signIn, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';

// GraphQL Mutation to create a user in DynamoDB
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1 = signup, 2 = verify
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const client = generateClient();

  // STEP 1: Register in Cognito
  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { userId } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: fullName,
          },
        },
      });

      console.log('Signup success, Cognito userId:', userId);
      setStep(2);
    } catch (e) {
      console.error('Signup error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Confirm code, then create User row with id = Cognito userId
  const handleVerification = async () => {
    if (!verificationCode) {
      setError('Please enter the code from your email.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // A. Confirm user in Cognito
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });

      // B. Sign in so we can call getCurrentUser and get userId
      await signIn({ username: email, password });

      const { userId } = await getCurrentUser();
      console.log('Confirmed + signed in. Cognito userId:', userId);

      // C. Create User in DynamoDB with id = userId
      await client.graphql({
        query: createUserMutation,
        variables: {
          input: {
            id: userId,      // 👈 KEY: DynamoDB PK matches Cognito userId
            email: email,
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

  return (
    <div className="form-container">
      <h2>{step === 1 ? 'Create Enterprise Account' : 'Verify Your Email'}</h2>

      {step === 1 && (
        <>
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
        </>
      )}

      {step === 2 && (
        <>
          <p style={{ textAlign: 'center', fontSize: '0.9em' }}>
            We sent a code to <strong>{email}</strong>.
          </p>
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="input-field"
          />
        </>
      )}

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {step === 1 ? (
        <button
          onClick={handleSignup}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? 'Registering...' : 'Sign Up'}
        </button>
      ) : (
        <button
          onClick={handleVerification}
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? 'Verifying...' : 'Confirm Account'}
        </button>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Already have an account?{' '}
        <button
          onClick={() => navigateTo('Login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Log In
        </button>
      </p>
    </div>
  );
}

export default SignupScreen;
