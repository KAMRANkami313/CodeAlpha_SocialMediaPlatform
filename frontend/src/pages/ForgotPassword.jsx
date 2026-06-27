import { useState } from 'react';
import { Link } from 'react-router-dom';
import { passwordResetService } from '../services/passwordResetService';
import { Mail, Send, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';

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
          <div className="auth-card-header">
            <KeyRound size={28} className="auth-card-icon" />
            <h2>Forgot Password</h2>
          </div>
          <p className="auth-subtitle">
            Enter your email and we'll send you a link to reset your password.
          </p>
          {error && (
            <div className="auth-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          {message && (
            <div className="auth-success">
              <CheckCircle2 size={14} />
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group auth-input-group">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input-with-icon"
              />
            </div>
            <button type="submit" className="btn auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
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