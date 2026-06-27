import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { MailCheck, CheckCircle2, AlertCircle, Loader2, ArrowLeft, MailWarning } from 'lucide-react';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    try {
      await API.get(`/verification/verify/${token}`);
      setVerified(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card">
          <div className="auth-card-header">
            {verified ? (
              <MailCheck size={28} className="auth-card-icon success" />
            ) : (
              <MailWarning size={28} className="auth-card-icon" />
            )}
            <h2>Email Verification</h2>
          </div>
          {verified ? (
            <div className="verify-success">
              <CheckCircle2 size={56} className="verify-success-icon" />
              <p className="verify-success-text">
                Your email has been verified successfully! Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <p className="auth-subtitle">
                Click the button below to verify your email address.
              </p>
              {error && (
                <div className="auth-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <button
                type="button"
                className="btn auth-submit-btn"
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? <Loader2 size={16} className="spin" /> : <MailCheck size={16} />}
                {verifying ? 'Verifying...' : 'Verify My Email'}
              </button>
              <p className="auth-switch-text">
                <Link to="/login" className="auth-back-link">
                  <ArrowLeft size={13} />
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;