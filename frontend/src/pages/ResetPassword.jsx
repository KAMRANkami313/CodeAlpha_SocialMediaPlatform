import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { passwordResetService } from '../services/passwordResetService';
import { Lock, KeyRound, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await passwordResetService.resetPassword(token, newPassword);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
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
            <h2>Reset Password</h2>
          </div>
          <p className="auth-subtitle">
            Enter your new password below.
          </p>
          {error && (
            <div className="auth-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group auth-input-group">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="auth-input-with-icon auth-input-with-action"
              />
              <button
                type="button"
                className="auth-input-action"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="form-group auth-input-group">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="auth-input-with-icon"
              />
            </div>
            <button type="submit" className="btn auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="auth-switch-text">
            <Link to="/login" className="auth-back-link">
              <ArrowLeft size={13} />
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;