import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchService } from '../../services/searchService';
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
  const [searchResults, setSearchResults] = useState({ users: [], posts: [], tags: [] });
  const [activeTab, setActiveTab] = useState('all');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

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
          const res = await searchService.searchAll(searchQuery);
          setSearchResults(res.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults({ users: [], posts: [], tags: [] });
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSelectUser = (profileUser) => {
    setSearchQuery('');
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

  const handleTagClick = (tag) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/?tag=${tag}`);
  };

  const handlePostClick = (postId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/?postId=${postId}`);
  };

  const hasResults = searchResults.users.length > 0 || searchResults.posts.length > 0 || searchResults.tags.length > 0;

  const showUsers = activeTab === 'all' || activeTab === 'users';
  const showPosts = activeTab === 'all' || activeTab === 'posts';
  const showTags = activeTab === 'all' || activeTab === 'tags';

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search users, posts, tags..."
          className="search-input"
          value={searchQuery}
          onFocus={() => setShowSearchDropdown(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {showSearchDropdown && (
        <div className="search-dropdown">
          {searchQuery ? (
            <>
              <div className="search-tabs">
                <button
                  className={`search-tab ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All
                </button>
                <button
                  className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  People ({searchResults.users.length})
                </button>
                <button
                  className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  Posts ({searchResults.posts.length})
                </button>
                <button
                  className={`search-tab ${activeTab === 'tags' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tags')}
                >
                  Tags ({searchResults.tags.length})
                </button>
              </div>

              {!hasResults && (
                <div style={{ padding: 'var(--space-6) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--secondary-text)', textAlign: 'center' }}>
                  No results found
                </div>
              )}

              {showUsers && searchResults.users.map((u) => (
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
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {u.username}
                      <VerifiedBadge show={u.isVerified} />
                    </div>
                    {u.bio && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary-text)' }}>{u.bio.slice(0, 40)}{u.bio.length > 40 ? '...' : ''}</span>}
                  </div>
                </Link>
              ))}

              {showPosts && searchResults.posts.map((post) => (
                <div
                  key={post._id}
                  className="search-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePostClick(post._id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      <Avatar src={post.user.profilePicture} alt="Avatar" className="search-item-avatar" style={{ width: '24px', height: '24px' }} />
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{post.user.username}</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.caption || '(no caption)'}
                    </p>
                  </div>
                </div>
              ))}

              {showTags && searchResults.tags.map((item) => (
                <div
                  key={item.tag}
                  className="search-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTagClick(item.tag)}
                >
                  <span className="hashtag" style={{ fontWeight: 600 }}>#{item.tag}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary-text)', marginLeft: 'auto' }}>
                    {item.count} {item.count === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              ))}
            </>
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