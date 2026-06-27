import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container">
        <div className="auth-card">
          <div className="auth-card-header">
            <Sparkles size={28} className="auth-card-icon" />
            <h2>Create account</h2>
          </div>
          <p className="auth-subtitle">
            Join SocialApp and connect with your community
          </p>
          {error && (
            <div className="auth-error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group auth-input-group">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="auth-input-with-icon"
              />
            </div>
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
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button type="submit" className="btn auth-submit-btn">
              <UserPlus size={16} />
              Sign Up
            </button>
          </form>
          <p className="auth-switch-text">
            Have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;