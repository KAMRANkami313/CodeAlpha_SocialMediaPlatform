import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Feed = () => {
  const { user, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag');
  const targetPostId = searchParams.get('postId');

  const [activeLikers, setActiveLikers] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const fetchPosts = async () => {
    try {
      if (targetPostId) {
        const response = await API.get(`/posts/${targetPostId}`);
        setPosts([response.data]);
      } else {
        const endpoint = currentTag ? `/posts?tag=${currentTag}` : '/posts';
        const response = await API.get(endpoint);
        setPosts(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSuggestions = async () => {
    if (!user) return;
    try {
      const response = await API.get('/users/suggested');
      setSuggestions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
  }, [currentTag, targetPostId, user]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await API.post('/posts', { caption, image });
      setCaption('');
      setImage('');
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (postId) => {
    try {
      const response = await API.post(`/users/save/${postId}`);
      const updatedSavedPosts = response.data.savedPosts;
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.savedPosts = updatedSavedPosts;
      localStorage.setItem('user', JSON.stringify(storedUser));
      setUser(storedUser);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await API.delete(`/posts/${postId}`);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const content = commentInputs[postId];
    if (!content) return;
    try {
      await API.post(`/posts/${postId}/comment`, { content });
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await API.delete(`/posts/${postId}/comment/${commentId}`);
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollowSuggestion = async (id) => {
    try {
      await API.post(`/users/follow/${id}`);
      fetchSuggestions();
      fetchPosts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSharePost = (postId) => {
    const deepLink = `${window.location.origin}/?postId=${postId}`;
    navigator.clipboard.writeText(deepLink);
    showToast('Direct link copied to clipboard!');
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const renderCaption = (text) => {
    const parts = text.split(/(\s+)/);
    return parts.map((part, index) => {
      if (part.startsWith('#') && part.length > 1) {
        const cleanTag = part.slice(1).replace(/[^\w]/g, '');
        return (
          <span
            key={index}
            className="hashtag"
            onClick={() => setSearchParams({ tag: cleanTag })}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      {(currentTag || targetPostId) && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{targetPostId ? 'Showing shared post' : `Showing posts for #${currentTag}`}</h2>
          <button className="btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={() => setSearchParams({})}>
            Show All Feed
          </button>
        </div>
      )}

      <div className="feed-layout">
        <div>
          {user && !currentTag && !targetPostId && (
            <div className="auth-card" style={{ marginBottom: '30px', textAlign: 'left' }}>
              <h3>Create Post</h3>
              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <textarea
                    rows="3"
                    placeholder="What's on your mind? Use #tags!"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn">Post</button>
              </form>
            </div>
          )}

          {posts.map((post) => (
            <div className="post-card" key={post._id}>
              <div className="post-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {post.user.profilePicture ? (
                    <img
                      src={post.user.profilePicture}
                      alt="Avatar"
                      className="post-avatar"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="post-avatar"></div>
                  )}
                  <Link to={`/profile/${post.user._id}`} style={{ display: 'flex', alignItems: 'center' }}>
                    {post.user.username}
                    {post.user.isVerified && <span className="verified-badge">✓</span>}
                  </Link>
                </div>
                {user && user.id === post.user._id && (
                  <button className="delete-btn" onClick={() => handleDeletePost(post._id)}>
                    Delete
                  </button>
                )}
              </div>
              {post.image && <img src={post.image} alt="Post content" className="post-image" />}
              <div className="post-actions" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button className="like-btn" onClick={() => handleLike(post._id)}>
                    {post.likes.some(l => l._id === user?.id) ? '❤️' : '🤍'}
                  </button>
                  <span className="likes-trigger" onClick={() => setActiveLikers(post.likes)}>
                    {post.likes.length} likes
                  </span>
                  <button className="like-btn" style={{ marginLeft: '15px' }} onClick={() => handleSharePost(post._id)}>
                    🔗
                  </button>
                </div>
                {user && (
                  <button
                    className="like-btn"
                    onClick={() => handleSave(post._id)}
                    style={{ marginRight: 0 }}
                  >
                    {user.savedPosts?.includes(post._id) ? '🔖' : '📁'}
                  </button>
                )}
              </div>
              <div className="post-content">
                <p>
                  <strong>{post.user.username}</strong> {renderCaption(post.caption)}
                </p>
              </div>
              <div className="comment-section">
                {post.comments.map((comment) => (
                  <div className="comment" key={comment._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {comment.user.profilePicture ? (
                        <img
                          src={comment.user.profilePicture}
                          alt="Avatar"
                          className="post-avatar"
                          style={{ width: '20px', height: '20px', marginRight: '8px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="post-avatar" style={{ width: '20px', height: '20px', marginRight: '8px' }}></div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <strong>{comment.user.username}</strong>
                        {comment.user.isVerified && <span className="verified-badge">✓</span>}
                        <span style={{ marginLeft: '8px' }}>{comment.content}</span>
                      </div>
                    </div>
                    {user && (user.id === comment.user._id || user.id === post.user._id) && (
                      <button className="delete-btn" style={{ fontSize: '11px' }} onClick={() => handleDeleteComment(post._id, comment._id)}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {user && (
                <form className="comment-form" onSubmit={(e) => handleCommentSubmit(e, post._id)}>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[post._id] || ''}
                    onChange={(e) => handleCommentChange(post._id, e.target.value)}
                    required
                  />
                  <button type="submit">Post</button>
                </form>
              )}
            </div>
          ))}
          {posts.length === 0 && (
            <div className="auth-card" style={{ textAlign: 'center', color: '#8e8e8e' }}>Post not found or has been deleted</div>
          )}
        </div>

        {user && !targetPostId && (
          <div className="sidebar-widget">
            <div className="sidebar-title">Suggestions for you</div>
            {suggestions.map((suggestion) => (
              <div className="suggestion-item" key={suggestion._id}>
                <div className="suggestion-info">
                  {suggestion.profilePicture ? (
                    <img
                      src={suggestion.profilePicture}
                      alt="Avatar"
                      className="suggestion-avatar"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="suggestion-avatar"></div>
                  )}
                  <Link to={`/profile/${suggestion._id}`} className="suggestion-username" style={{ display: 'flex', alignItems: 'center' }}>
                    {suggestion.username}
                    {suggestion.isVerified && <span className="verified-badge">✓</span>}
                  </Link>
                </div>
                <button className="follow-link" onClick={() => handleFollowSuggestion(suggestion._id)}>
                  Follow
                </button>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div style={{ fontSize: '12px', color: '#8e8e8e' }}>No new suggestions</div>
            )}
          </div>
        )}
      </div>

      {activeLikers && (
        <div className="modal-overlay" onClick={() => setActiveLikers(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Likes</span>
              <button className="modal-close-btn" onClick={() => setActiveLikers(null)}>×</button>
            </div>
            <div className="modal-body">
              {activeLikers.map((liker) => (
                <div key={liker._id} className="suggestion-item" style={{ marginBottom: '15px' }}>
                  <div className="suggestion-info">
                    {liker.profilePicture ? (
                      <img
                        src={liker.profilePicture}
                        alt="Avatar"
                        className="suggestion-avatar"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="suggestion-avatar" style={{ width: '32px', height: '32px' }}></div>
                    )}
                    <Link
                      to={`/profile/${liker._id}`}
                      className="suggestion-username"
                      style={{ display: 'flex', alignItems: 'center' }}
                      onClick={() => setActiveLikers(null)}
                    >
                      {liker.username}
                      {liker.isVerified && <span className="verified-badge">✓</span>}
                    </Link>
                  </div>
                </div>
              ))}
              {activeLikers.length === 0 && (
                <div style={{ textAlign: 'center', color: '#8e8e8e', fontSize: '14px' }}>No likes yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast-container">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Feed;