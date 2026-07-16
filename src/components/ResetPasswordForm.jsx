import { useState } from 'react';
import { resetPassword } from '../services/auth.service';

function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
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
        <p className="subtitle">Set a new password</p>

        {error && <div className="auth-error">{error}</div>}

        {done ? (
          <>
            <p className="auth-message">Password updated. You can now log in.</p>
            <p className="auth-toggle">
              <a className="link-btn" href="/">Go to log in</a>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordForm;
