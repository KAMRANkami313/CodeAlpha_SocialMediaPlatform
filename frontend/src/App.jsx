import { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import API from './services/api';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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

  const handleSelectUser = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

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

      <div className="navbar-links">
        <Link to="/">Home</Link>
        {user ? (
          <>
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