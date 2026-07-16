import { useState } from 'react';
import { login as loginRequest, register as registerRequest, forgotPassword } from '../services/auth.service';
import { useAuth } from '../AuthContext';

function AuthForm() {
  const { login: setAuth } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      if (mode === 'forgot') {
        const { message } = await forgotPassword(email);
        setMessage(message);
      } else {
        const request = mode === 'login' ? loginRequest : registerRequest;
        const { token, user } = await request(email, password);
        setAuth(token, user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setMessage('');
  };

  const title = {
    login: 'Log in to your account',
    register: 'Create an account',
    forgot: 'Reset your password',
  }[mode];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h1>Finance Tracker</h1>
        <p className="subtitle">{title}</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <p className="auth-message">{message}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {mode !== 'forgot' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          <button type="submit" disabled={submitting}>
            {submitting
              ? 'Please wait...'
              : mode === 'login'
              ? 'Log In'
              : mode === 'register'
              ? 'Sign Up'
              : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="auth-toggle">
            <button type="button" className="link-btn" onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
          </p>
        )}

        <p className="auth-toggle">
          {mode === 'forgot' ? (
            <button type="button" className="link-btn" onClick={() => switchMode('login')}>
              Back to log in
            </button>
          ) : (
            <>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="link-btn"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default AuthForm;
