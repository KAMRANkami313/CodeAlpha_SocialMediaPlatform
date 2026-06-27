import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import useNotifications from '../../hooks/useNotifications';
import useUnreadMessages from '../../hooks/useUnreadMessages';
import useActivityHeartbeat from '../../hooks/useActivityHeartbeat';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';
import {
  Home,
  Compass,
  Mail,
  User,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  LogIn,
  UserPlus
} from 'lucide-react';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { notifications, fetchNotifications } = useNotifications(user);
  const unreadMessages = useUnreadMessages(user);
  useActivityHeartbeat(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <SparklesMinimal />
        <span>SocialApp</span>
      </Link>

      <SearchBar user={user} />

      <div className="navbar-links" style={{ position: 'relative' }}>
        <Link to="/" className="navbar-link-with-icon" aria-label="Home">
          <Home size={18} />
          <span className="navbar-link-label">Home</span>
        </Link>
        {user ? (
          <>
            <Link to="/explore" className="navbar-link-with-icon" aria-label="Explore">
              <Compass size={18} />
              <span className="navbar-link-label">Explore</span>
            </Link>
            <Link to="/messages" className="navbar-link-with-icon" style={{ position: 'relative' }} aria-label="Messages">
              <Mail size={18} />
              <span className="navbar-link-label">Messages</span>
              {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
            </Link>
            <NotificationDropdown
              notifications={notifications}
              fetchNotifications={fetchNotifications}
            />
            <Link to={`/profile/${user.id}`} className="navbar-link-with-icon" aria-label="Profile">
              <User size={18} />
              <span className="navbar-link-label">Profile</span>
            </Link>
            <button onClick={toggleTheme} className="navbar-icon-btn" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={logoutUser} className="navbar-icon-btn" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <button onClick={toggleTheme} className="navbar-icon-btn" aria-label="Toggle theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/login" className="navbar-link-with-icon" aria-label="Login">
              <LogIn size={18} />
              <span className="navbar-link-label">Login</span>
            </Link>
            <Link to="/register" className="navbar-link-with-icon" aria-label="Register">
              <UserPlus size={18} />
              <span className="navbar-link-label">Register</span>
            </Link>
          </>
        )}
      </div>

      <button
        className={`navbar-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu" onClick={closeMobileMenu}>
          <Link to="/" className="navbar-mobile-link">
            <Home size={18} />
            <span>Home</span>
          </Link>
          {user ? (
            <>
              <Link to="/explore" className="navbar-mobile-link">
                <Compass size={18} />
                <span>Explore</span>
              </Link>
              <Link to="/messages" className="navbar-mobile-link">
                <Mail size={18} />
                <span>Messages</span>
                {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
              </Link>
              <NotificationDropdown
                notifications={notifications}
                fetchNotifications={fetchNotifications}
                mobile
              />
              <Link to={`/profile/${user.id}`} className="navbar-mobile-link">
                <User size={18} />
                <span>Profile</span>
              </Link>
              <button onClick={toggleTheme} className="navbar-mobile-link">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <button onClick={logoutUser} className="navbar-mobile-link navbar-mobile-danger">
                <LogOut size={18} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleTheme} className="navbar-mobile-link">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <Link to="/login" className="navbar-mobile-link">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="navbar-mobile-link">
                <UserPlus size={18} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const SparklesMinimal = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75z" />
  </svg>
);

export default Navbar;