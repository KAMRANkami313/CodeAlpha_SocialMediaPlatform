import { useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeContext, ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Explore from './pages/Explore';
import API from './services/api';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [unreadMessages, setUnreadMessages] = useState(0);

  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`recent_searches_${user.id}`);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    }
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery) {
        try {
          const res = await API.get(`/users/search?q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await API.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    if (!user) return;
    try {
      const res = await API.get('/messages/unread-count');
      setUnreadMessages(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadMessagesCount();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadMessagesCount();
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const transmitHeartbeat = async () => {
      try {
        await API.put('/users/ping');
      } catch (err) {
        console.error(err);
      }
    };
    transmitHeartbeat();
    const heartbeatInterval = setInterval(transmitHeartbeat, 30000);
    return () => clearInterval(heartbeatInterval);
  }, [user]);

  const handleSelectUser = (profileUser) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);

    if (user) {
      const key = `recent_searches_${user.id}`;
      let currentRecents = [...recentSearches];
      currentRecents = currentRecents.filter(u => u._id !== profileUser._id);
      currentRecents = [profileUser, ...currentRecents].slice(0, 5);
      setRecentSearches(currentRecents);
      localStorage.setItem(key, JSON.stringify(currentRecents));
    }
  };

  const handleRemoveRecent = (e, profileId) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      const key = `recent_searches_${user.id}`;
      const filtered = recentSearches.filter(u => u._id !== profileId);
      setRecentSearches(filtered);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  };

  const handleClearAllRecents = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      const key = `recent_searches_${user.id}`;
      setRecentSearches([]);
      localStorage.removeItem(key);
    }
  };

  const handleToggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some(n => !n.read)) {
      try {
        await API.put('/notifications/read');
        fetchNotifications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">SocialApp</Link>

      <div className="search-container" ref={searchRef}>
        <input
          type="text"
          placeholder="Search users..."
          className="search-input"
          value={searchQuery}
          onFocus={() => setShowSearchDropdown(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {showSearchDropdown && (
          <div className="search-dropdown">
            {searchQuery ? (
              searchResults.map((u) => (
                <Link
                  key={u._id}
                  to={`/profile/${u._id}`}
                  className="search-item"
                  style={{ display: 'flex', alignItems: 'center' }}
                  onClick={() => handleSelectUser(u)}
                >
                  {u.profilePicture ? (
                    <img
                      src={u.profilePicture}
                      alt="Avatar"
                      className="search-item-avatar"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="search-item-avatar"></div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {u.username}
                    {u.isVerified && <span className="verified-badge">✓</span>}
                  </div>
                </Link>
              ))
            ) : (
              <div>
                {recentSearches.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--secondary-text)' }}>Recent</span>
                      <button
                        onClick={handleClearAllRecents}
                        style={{ background: 'none', border: 'none', color: '#0095f6', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '0' }}
                      >
                        Clear All
                      </button>
                    </div>
                    {recentSearches.map((u) => (
                      <Link
                        key={u._id}
                        to={`/profile/${u._id}`}
                        className="search-item"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onClick={() => setShowSearchDropdown(false)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {u.profilePicture ? (
                            <img
                              src={u.profilePicture}
                              alt="Avatar"
                              className="search-item-avatar"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="search-item-avatar"></div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {u.username}
                            {u.isVerified && <span className="verified-badge">✓</span>}
                          </div>
                        </div>
                        <button
                          className="delete-btn"
                          style={{ fontSize: '14px', marginRight: '5px' }}
                          onClick={(e) => handleRemoveRecent(e, u._id)}
                        >
                          ×
                        </button>
                      </Link>
                    ))}
                  </>
                ) : (
                  <div style={{ padding: '20px', fontSize: '12px', color: 'var(--secondary-text)', textAlign: 'center' }}>
                    No recent searches
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-links" style={{ position: 'relative' }}>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/explore">Explore</Link>
            <Link to="/messages" style={{ position: 'relative' }}>
              Messages
              {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
            </Link>
            <button onClick={handleToggleNotifications} style={{ position: 'relative' }}>
              Notifications
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.map((n) => (
                  <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                    {n.sender.profilePicture ? (
                      <img
                        src={n.sender.profilePicture}
                        alt="Avatar"
                        className="notification-avatar"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="notification-avatar"></div>
                    )}
                    <div>
                      <strong style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                        {n.sender.username}
                        {n.sender.isVerified && <span className="verified-badge">✓</span>}
                      </strong>{' '}
                      {n.type === 'like' && 'liked your post'}
                      {n.type === 'comment' && 'commented on your post'}
                      {n.type === 'follow' && 'started following you'}
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div style={{ padding: '15px', fontSize: '12px', color: '#8e8e8e', textAlign: 'center' }}>
                    No notifications yet
                  </div>
                )}
              </div>
            )}
            <Link to={`/profile/${user.id}`}>Profile</Link>
            <button onClick={toggleTheme} style={{ fontSize: '16px' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={logoutUser}>Log Out</button>
          </>
        ) : (
          <>
            <button onClick={toggleTheme} style={{ fontSize: '16px' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const AppContent = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;