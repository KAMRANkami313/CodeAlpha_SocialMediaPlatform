import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

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
          <h2>Email Verification</h2>
          {verified ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>✓</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--secondary-text)' }}>
                Your email has been verified successfully! Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--secondary-text)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-6) 0' }}>
                Click the button below to verify your email address.
              </p>
              {error && <p className="auth-error">{error}</p>}
              <button
                type="button"
                className="btn"
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify My Email'}
              </button>
              <p className="auth-switch-text" style={{ marginTop: 'var(--space-4)' }}>
                <Link to="/login">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;