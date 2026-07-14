import { useState } from 'react';
import { login as loginRequest, register as registerRequest } from '../services/auth.service';
import { useAuth } from '../AuthContext';

function AuthForm() {
  const { login: setAuth } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const request = mode === 'login' ? loginRequest : registerRequest;
      const { token, user } = await request(email, password);
      setAuth(token, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h1>Finance Tracker</h1>
        <p className="subtitle">{mode === 'login' ? 'Log in to your account' : 'Create an account'}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
