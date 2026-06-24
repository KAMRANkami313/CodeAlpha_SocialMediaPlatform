import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Feed = () => {
  const { user, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stories, setStories] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag');
  const targetPostId = searchParams.get('postId');

  const [activeLikers, setActiveLikers] = useState(null);
  const [toast, setToast] = useState('');

  const [storyCreateModal, setStoryCreateModal] = useState(false);
  const [storyImg, setStoryImg] = useState('');
  const [storyText, setStoryText] = useState('');
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editCaptionText, setEditCaptionText] = useState('');

  const progressInterval = useRef(null);

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

  const fetchStories = async () => {
    if (!user) return;
    try {
      const response = await API.get('/stories');
      setStories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSuggestions();
    fetchStories();
  }, [currentTag, targetPostId, user]);

  useEffect(() => {
    if (activeStoryGroup) {
      setStoryProgress(0);
      progressInterval.current = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            setActiveStoryGroup(null);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeStoryGroup]);

  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      await API.post('/stories', { image: storyImg, text: storyText });
      setStoryImg('');
      setStoryText('');
      setStoryCreateModal(false);
      fetchStories();
    } catch (error) {
      console.error(error);
    }
  };

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

  const handleStartEdit = (post) => {
    setEditingPostId(post._id);
    setEditCaptionText(post.caption);
  };

  const handleSaveEdit = async (postId) => {
    try {
      await API.put(`/posts/${postId}`, { caption: editCaptionText });
      setEditingPostId(null);
      setEditCaptionText('');
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

  const handleLikeComment = async (postId, commentId) => {
    try {
      await API.post(`/posts/${postId}/comment/${commentId}/like`);
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
      {user && !currentTag && !targetPostId && (
        <div className="stories-container">
          <div className="story-circle-wrapper" onClick={() => setStoryCreateModal(true)}>
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="My Avatar" className="story-circle" style={{ borderColor: '#dbdbdb' }} />
            ) : (
              <div className="story-circle" style={{ borderColor: '#dbdbdb', backgroundColor: '#dbdbdb' }}></div>
            )}
            <span className="story-username">Add Story</span>
          </div>

          {stories.map((group) => (
            <div key={group.user._id} className="story-circle-wrapper" onClick={() => setActiveStoryGroup(group)}>
              {group.user.profilePicture ? (
                <img src={group.user.profilePicture} alt="Avatar" className="story-circle" />
              ) : (
                <div className="story-circle" style={{ backgroundColor: '#dbdbdb' }}></div>
              )}
              <span className="story-username" style={{ display: 'flex', alignItems: 'center' }}>
                {group.user.username}
                {group.user.isVerified && <span className="verified-badge" style={{ width: '9px', height: '9px', fontSize: '6px' }}>✓</span>}
              </span>
            </div>
          ))}
        </div>
      )}

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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="delete-btn" style={{ color: '#0095f6' }} onClick={() => handleStartEdit(post)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDeletePost(post._id)}>
                      Delete
                    </button>
                  </div>
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
                {editingPostId === post._id ? (
                  <div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <textarea
                        value={editCaptionText}
                        onChange={(e) => setEditCaptionText(e.target.value)}
                        rows="2"
                      />
                    </div>
                    <button className="btn" style={{ width: 'auto', padding: '3px 12px', fontSize: '12px', marginRight: '10px' }} onClick={() => handleSaveEdit(post._id)}>
                      Save
                    </button>
                    <button className="btn" style={{ width: 'auto', padding: '3px 12px', fontSize: '12px', backgroundColor: '#dbdbdb', color: '#000' }} onClick={() => setEditingPostId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <p>
                    <strong>{post.user.username}</strong> {renderCaption(post.caption)}
                  </p>
                )}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button className="delete-btn" style={{ fontSize: '12px' }} onClick={() => handleLikeComment(post._id, comment._id)}>
                        {comment.likes?.includes(user?.id) ? '❤️' : '🤍'}
                        <span style={{ fontSize: '10px', marginLeft: '3px' }}>{comment.likes?.length || 0}</span>
                      </button>
                      {user && (user.id === comment.user._id || user.id === post.user._id) && (
                        <button className="delete-btn" style={{ fontSize: '13px' }} onClick={() => handleDeleteComment(post._id, comment._id)}>
                          ×
                        </button>
                      )}
                    </div>
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

      {storyCreateModal && (
        <div className="modal-overlay" onClick={() => setStoryCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Add Story</span>
              <button className="modal-close-btn" onClick={() => setStoryCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateStory}>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Story Image URL"
                    value={storyImg}
                    onChange={(e) => setStoryImg(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Story Text (Optional)"
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn">Share to Story</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeStoryGroup && (
        <div className="story-modal-overlay" onClick={() => setActiveStoryGroup(null)}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="story-progress-bar-bg">
              <div className="story-progress-bar-fg" style={{ width: `${storyProgress}%` }}></div>
            </div>
            <div className="story-header-info">
              {activeStoryGroup.user.profilePicture ? (
                <img src={activeStoryGroup.user.profilePicture} alt="Avatar" className="story-header-avatar" />
              ) : (
                <div className="story-header-avatar" style={{ backgroundColor: '#dbdbdb' }}></div>
              )}
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {activeStoryGroup.user.username}
                {activeStoryGroup.user.isVerified && <span className="verified-badge" style={{ width: '9px', height: '9px', fontSize: '6px' }}>✓</span>}
              </span>
            </div>
            <img
              src={activeStoryGroup.stories[0].image}
              alt="Story"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {activeStoryGroup.stories[0].text && (
              <div className="story-text-overlay">
                {activeStoryGroup.stories[0].text}
              </div>
            )}
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