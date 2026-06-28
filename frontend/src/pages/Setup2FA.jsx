import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ShieldCheck, QrCode, KeyRound, Check, Loader2, AlertCircle, Copy, Download, ArrowLeft, ShieldOff } from 'lucide-react';

const Setup2FA = () => {
  const [step, setStep] = useState('loading');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const codeInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await authService.getTwoFactorStatus();
        if (res.data.twoFactorEnabled) {
          setEnabled(true);
          setStep('enabled');
        } else {
          setStep('intro');
        }
      } catch (err) {
        setStep('intro');
      }
    };
    checkStatus();
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authService.setupTwoFactor();
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep('qr');
      setTimeout(() => {
        if (codeInputRef.current) codeInputRef.current.focus();
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start 2FA setup');
      setStep('intro');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyTwoFactorSetup(code);
      setBackupCodes(res.data.backupCodes);
      setEnabled(true);
      setStep('backup');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackupCodes = () => {
    const content = `SocialApp - Two-Factor Authentication Backup Codes\n\nThese codes can be used to log in if you lose access to your authenticator app.\nEach code can only be used once.\n\n${backupCodes.join('\n')}\n\nKeep these codes safe and secure!\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'socialapp-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDisable = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.disableTwoFactor(disablePassword);
      setEnabled(false);
      setDisablePassword('');
      setStep('intro');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card setup-2fa-card">
          <div className="auth-card-header">
            <ShieldCheck size={28} className="auth-card-icon" />
            <h2>Two-Factor Authentication</h2>
          </div>

          {step === 'loading' && (
            <div className="setup-2fa-loading">
              <Loader2 size={28} className="spin" />
              <span>Checking status…</span>
            </div>
          )}

          {step === 'intro' && (
            <div className="setup-2fa-intro">
              <p className="auth-subtitle">
                Add an extra layer of security to your account. After enabling 2FA, you'll need a verification code from your authenticator app each time you log in.
              </p>
              <ul className="setup-2fa-benefits">
                <li><Check size={14} /> Protects against password theft</li>
                <li><Check size={14} /> Works with Google Authenticator, Authy, 1Password</li>
                <li><Check size={14} /> Backup codes for emergency access</li>
              </ul>
              {error && (
                <div className="auth-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <button className="btn auth-submit-btn" onClick={handleSetup} disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
                Enable 2FA
              </button>
            </div>
          )}

          {step === 'qr' && (
            <div className="setup-2fa-qr">
              <p className="auth-subtitle">
                Scan this QR code with your authenticator app, then enter the 6-digit code below.
              </p>
              <div className="qr-code-wrapper">
                <img src={qrCode} alt="2FA QR Code" className="qr-code-img" />
              </div>
              <div className="secret-key-wrapper">
                <span className="secret-label">Or enter this key manually:</span>
                <div className="secret-key-display">
                  <code>{secret}</code>
                  <button
                    className="secret-copy-btn"
                    onClick={handleCopySecret}
                    aria-label="Copy secret key"
                    title="Copy"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="auth-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <form onSubmit={handleVerify}>
                <div className="form-group auth-input-group">
                  <KeyRound size={16} className="auth-input-icon" />
                  <input
                    ref={codeInputRef}
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    maxLength={6}
                    className="auth-input-with-icon two-factor-input"
                    autoComplete="one-time-code"
                  />
                </div>
                <button type="submit" className="btn auth-submit-btn" disabled={loading || code.length !== 6}>
                  {loading ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                  {loading ? 'Verifying…' : 'Verify & Enable'}
                </button>
              </form>
            </div>
          )}

          {step === 'backup' && (
            <div className="setup-2fa-backup">
              <div className="backup-success-banner">
                <Check size={20} />
                <span>2FA enabled successfully!</span>
              </div>
              <p className="auth-subtitle">
                Save these backup codes somewhere safe. Each can be used once if you lose access to your authenticator app.
              </p>
              <div className="backup-codes-grid">
                {backupCodes.map((code, i) => (
                  <div key={i} className="backup-code-item">{code}</div>
                ))}
              </div>
              <button className="btn auth-submit-btn" onClick={handleDownloadBackupCodes}>
                <Download size={16} />
                Download Backup Codes
              </button>
              <button
                className="btn auth-back-link"
                onClick={() => navigate('/')}
                style={{ marginTop: 'var(--space-3)' }}
              >
                Done — Take me to the app
              </button>
            </div>
          )}

          {step === 'enabled' && (
            <div className="setup-2fa-enabled">
              <div className="enabled-banner">
                <ShieldCheck size={20} />
                <span>2FA is currently enabled on your account.</span>
              </div>
              <p className="auth-subtitle">
                To disable 2FA, enter your password below. You'll need to set it up again if you want to re-enable it later.
              </p>
              {error && (
                <div className="auth-error">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <form onSubmit={handleDisable}>
                <div className="form-group auth-input-group">
                  <KeyRound size={16} className="auth-input-icon" />
                  <input
                    type="password"
                    placeholder="Your password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    className="auth-input-with-icon"
                  />
                </div>
                <button type="submit" className="btn settings-danger-btn auth-submit-btn" disabled={loading || !disablePassword}>
                  {loading ? <Loader2 size={16} className="spin" /> : <ShieldOff size={16} />}
                  {loading ? 'Disabling…' : 'Disable 2FA'}
                </button>
              </form>
            </div>
          )}

          <p className="auth-switch-text" style={{ marginTop: 'var(--space-4)' }}>
            <Link to="/" className="auth-back-link">
              <ArrowLeft size={13} />
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setup2FA;