import { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import API from './services/api';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSelectUser = () => {
    setSearchQuery('');
    setSearchResults([]);
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

      <div className="search-container">
        <input
          type="text"
          placeholder="Search users..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                className="search-item"
                onClick={handleSelectUser}
              >
                <div className="search-item-avatar"></div>
                <div>{u.username}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="navbar-links" style={{ position: 'relative' }}>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/messages">Messages</Link>
            <button onClick={handleToggleNotifications} style={{ position: 'relative' }}>
              Notifications
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notification-dropdown">
                {notifications.map((n) => (
                  <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                    <div className="notification-avatar"></div>
                    <div>
                      <strong>{n.sender.username}</strong>{' '}
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
            <button onClick={logoutUser}>Log Out</button>
          </>
        ) : (
          <>
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
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;