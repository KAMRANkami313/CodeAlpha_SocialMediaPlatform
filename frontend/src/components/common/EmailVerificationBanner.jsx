import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import { MailWarning, RotateCw, CheckCircle2 } from 'lucide-react';

const EmailVerificationBanner = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    setMessage('');
    setIsSuccess(false);
    try {
      const res = await API.post('/verification/resend');
      setMessage(res.data.message);
      setIsSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to send verification email');
      setIsSuccess(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verification-banner">
      <div className="verification-banner-content">
        <span className="verification-banner-icon">
          <MailWarning size={20} />
        </span>
        <div className="verification-banner-text">
          <strong>Please verify your email address</strong>
          <span>Check your inbox for the verification link. Unverified accounts may have limited access.</span>
        </div>
        <div className="verification-banner-actions">
          {message && (
            <span className={`verification-banner-message ${isSuccess ? 'success' : 'error'}`}>
              {isSuccess && <CheckCircle2 size={14} />}
              {message}
            </span>
          )}
          <button
            className="verification-banner-btn"
            onClick={handleResend}
            disabled={sending}
          >
            {sending ? <RotateCw size={14} className="spin" /> : null}
            {sending ? 'Sending...' : 'Resend'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;