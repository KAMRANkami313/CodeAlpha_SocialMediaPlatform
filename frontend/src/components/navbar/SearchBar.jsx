import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { STORAGE_KEYS, SEARCH_DEBOUNCE_MS, RECENT_SEARCHES_LIMIT } from '../../utils/constants';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const SearchIcon = () => (
  <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SearchBar = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${STORAGE_KEYS.RECENT_SEARCHES_PREFIX}${user.id}`);
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
          const res = await userService.search(searchQuery);
          setSearchResults(res.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSelectUser = (profileUser) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);

    if (user) {
      const key = `${STORAGE_KEYS.RECENT_SEARCHES_PREFIX}${user.id}`;
      let currentRecents = [...recentSearches];
      currentRecents = currentRecents.filter(u => u._id !== profileUser._id);
      currentRecents = [profileUser, ...currentRecents].slice(0, RECENT_SEARCHES_LIMIT);
      setRecentSearches(currentRecents);
      localStorage.setItem(key, JSON.stringify(currentRecents));
    }
  };

  const handleRemoveRecent = (e, profileId) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      const key = `${STORAGE_KEYS.RECENT_SEARCHES_PREFIX}${user.id}`;
      const filtered = recentSearches.filter(u => u._id !== profileId);
      setRecentSearches(filtered);
      localStorage.setItem(key, JSON.stringify(filtered));
    }
  };

  const handleClearAllRecents = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      const key = `${STORAGE_KEYS.RECENT_SEARCHES_PREFIX}${user.id}`;
      setRecentSearches([]);
      localStorage.removeItem(key);
    }
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search users..."
          className="search-input"
          value={searchQuery}
          onFocus={() => setShowSearchDropdown(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {showSearchDropdown && (
        <div className="search-dropdown">
          {searchQuery ? (
            searchResults.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                className="search-item"
                onClick={() => handleSelectUser(u)}
              >
                <Avatar
                  src={u.profilePicture}
                  alt="Avatar"
                  className="search-item-avatar"
                />
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {u.username}
                  <VerifiedBadge show={u.isVerified} />
                </div>
              </Link>
            ))
          ) : (
            <div>
              {recentSearches.length > 0 ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent</span>
                    <button
                      onClick={handleClearAllRecents}
                      style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 600, padding: '0' }}
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
                        <Avatar
                          src={u.profilePicture}
                          alt="Avatar"
                          className="search-item-avatar"
                        />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {u.username}
                          <VerifiedBadge show={u.isVerified} />
                        </div>
                      </div>
                      <button
                        className="delete-btn"
                        style={{ fontSize: 'var(--text-lg)', marginRight: 'var(--space-1)', color: 'var(--secondary-text)' }}
                        onClick={(e) => handleRemoveRecent(e, u._id)}
                      >
                        ×
                      </button>
                    </Link>
                  ))}
                </>
              ) : (
                <div style={{ padding: 'var(--space-6) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--secondary-text)', textAlign: 'center' }}>
                  No recent searches
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;