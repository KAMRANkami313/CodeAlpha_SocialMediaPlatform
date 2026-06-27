import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

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
            <button type="submit" className="btn auth-submit-btn">
              <LogIn size={16} />
              Log In
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