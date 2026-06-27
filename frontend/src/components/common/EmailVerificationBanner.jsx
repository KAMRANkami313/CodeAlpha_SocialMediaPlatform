import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';

const EmailVerificationBanner = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    setMessage('');
    try {
      const res = await API.post('/verification/resend');
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verification-banner">
      <div className="verification-banner-content">
        <span className="verification-banner-icon">📧</span>
        <div className="verification-banner-text">
          <strong>Please verify your email address</strong>
          <span>Check your inbox for the verification link. Unverified accounts may have limited access.</span>
        </div>
        <div className="verification-banner-actions">
          {message && <span className="verification-banner-message">{message}</span>}
          <button
            className="verification-banner-btn"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Resend'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;