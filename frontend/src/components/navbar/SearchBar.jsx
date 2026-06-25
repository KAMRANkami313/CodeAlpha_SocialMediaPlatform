import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/userService';
import { STORAGE_KEYS, SEARCH_DEBOUNCE_MS, RECENT_SEARCHES_LIMIT } from '../../utils/constants';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

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
  );
};

export default SearchBar;