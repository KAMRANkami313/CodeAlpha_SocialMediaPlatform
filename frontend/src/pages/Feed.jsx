import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Feed = () => {
  const { user, setUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag');

  const fetchPosts = async () => {
    try {
      const endpoint = currentTag ? `/posts?tag=${currentTag}` : '/posts';
      const response = await API.get(endpoint);
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentTag]);

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
    <div className="container">
      {currentTag && (
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Showing posts for #{currentTag}</h2>
          <button className="btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={() => setSearchParams({})}>
            Clear Filter
          </button>
        </div>
      )}

      {user && !currentTag && (
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
          <div className="post-header">
            <div className="post-avatar"></div>
            <Link to={`/profile/${post.user._id}`}>{post.user.username}</Link>
          </div>
          {post.image && <img src={post.image} alt="Post content" className="post-image" />}
          <div className="post-actions" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button className="like-btn" onClick={() => handleLike(post._id)}>
                {post.likes.includes(user?.id) ? '❤️' : '🤍'}
              </button>
              <span>{post.likes.length} likes</span>
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
              <div className="comment" key={comment._id}>
                <strong>{comment.user.username}</strong> {comment.content}
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
    </div>
  );
};

export default Feed;