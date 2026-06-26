import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetService } from '../services/passwordResetService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await passwordResetService.requestReset(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card">
          <h2>Forgot Password</h2>
          <p style={{ color: 'var(--secondary-text)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-6) 0' }}>
            Enter your email and we'll send you a link to reset your password.
          </p>
          {error && <p className="auth-error">{error}</p>}
          {message && (
            <p style={{ color: 'var(--success)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-4) 0', padding: 'var(--space-2) var(--space-3)', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)' }}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="auth-switch-text">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;