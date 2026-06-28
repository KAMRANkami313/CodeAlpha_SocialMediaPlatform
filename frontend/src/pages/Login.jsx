import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Eye, EyeOff, ShieldCheck, KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const { loginUser, completeTwoFactorLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const twoFactorInputRef = useRef(null);

  useEffect(() => {
    if (twoFactorRequired && twoFactorInputRef.current) {
      twoFactorInputRef.current.focus();
    }
  }, [twoFactorRequired]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      if (data.requiresTwoFactor) {
        setTempToken(data.tempToken);
        setTwoFactorRequired(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await completeTwoFactorLogin(tempToken, twoFactorCode, useBackupCode, rememberDevice);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setTwoFactorRequired(false);
    setTempToken('');
    setTwoFactorCode('');
    setUseBackupCode(false);
    setError('');
  };

  if (twoFactorRequired) {
    return (
      <div className="auth-page-wrapper">
        <div className="container">
          <div className="auth-card">
            <div className="auth-card-header">
              <ShieldCheck size={28} className="auth-card-icon" />
              <h2>Two-Factor Authentication</h2>
            </div>
            <p className="auth-subtitle">
              {useBackupCode
                ? 'Enter one of your 8-character backup codes.'
                : 'Enter the 6-digit code from your authenticator app.'
              }
            </p>
            {error && (
              <div className="auth-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <form onSubmit={handleTwoFactorSubmit}>
              <div className="form-group auth-input-group">
                <KeyRound size={16} className="auth-input-icon" />
                <input
                  ref={twoFactorInputRef}
                  type="text"
                  placeholder={useBackupCode ? 'Backup code' : '123456'}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  required
                  maxLength={useBackupCode ? 8 : 6}
                  className="auth-input-with-icon two-factor-input"
                  autoComplete="one-time-code"
                />
              </div>
              <label className="remember-device-checkbox">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                />
                <span>Remember this device for 30 days</span>
              </label>
              <button type="submit" className="btn auth-submit-btn" disabled={loading || !twoFactorCode}>
                {loading ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />}
                {loading ? 'Verifying…' : 'Verify & Log In'}
              </button>
            </form>
            <button
              type="button"
              className="auth-back-link"
              onClick={handleBackToLogin}
              style={{ marginBottom: 'var(--space-2)' }}
            >
              <ArrowLeft size={13} />
              Back to login
            </button>
            <p className="auth-switch-text">
              <button
                type="button"
                className="auth-text-btn"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setTwoFactorCode('');
                  setError('');
                }}
              >
                {useBackupCode ? 'Use authenticator code instead' : 'Use a backup code instead'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card">
          <div className="auth-card-header">
            <Sparkles size={28} className="auth-card-icon" />
            <h2>Welcome back</h2>
          </div>
          <p className="auth-subtitle">
            Sign in to continue to SocialApp
          </p>
          {error && (
            <div className="auth-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group auth-input-group">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input-with-icon"
              />
            </div>
            <div className="form-group auth-input-group">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <button type="submit" className="btn auth-submit-btn" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <LogIn size={16} />}
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>
          <p className="auth-switch-text">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
          <p className="auth-switch-text" style={{ marginTop: 'var(--space-3)' }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;