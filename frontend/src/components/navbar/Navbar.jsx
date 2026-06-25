import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import useNotifications from '../../hooks/useNotifications';
import useUnreadMessages from '../../hooks/useUnreadMessages';
import useActivityHeartbeat from '../../hooks/useActivityHeartbeat';
import SearchBar from './SearchBar';
import NotificationDropdown from './NotificationDropdown';

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
      <Link to="/" className="navbar-brand">SocialApp</Link>

      <SearchBar user={user} />

      <div className="navbar-links" style={{ position: 'relative' }}>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/explore">Explore</Link>
            <Link to="/messages" style={{ position: 'relative' }}>
              Messages
              {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
            </Link>
            <NotificationDropdown
              notifications={notifications}
              fetchNotifications={fetchNotifications}
            />
            <Link to={`/profile/${user.id}`}>Profile</Link>
            <button onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={logoutUser}>Log Out</button>
          </>
        ) : (
          <>
            <button onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>

      <button
        className={`navbar-mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu" onClick={closeMobileMenu}>
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/explore">Explore</Link>
              <Link to="/messages">
                Messages
                {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
              </Link>
              <Link to={`/profile/${user.id}`}>Profile</Link>
              <button onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              <button onClick={logoutUser}>Log Out</button>
            </>
          ) : (
            <>
              <button onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;