import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Feed = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const fetchPosts = async () => {
    try {
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  return (
    <div className="container">
      {user && (
        <div className="auth-card" style={{ marginBottom: '30px', textAlign: 'left' }}>
          <h3>Create Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <textarea
                rows="3"
                placeholder="What's on your mind?"
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
          <div className="post-actions">
            <button className="like-btn" onClick={() => handleLike(post._id)}>
              {post.likes.includes(user?.id) ? '❤️' : '🤍'}
            </button>
            <span>{post.likes.length} likes</span>
          </div>
          <div className="post-content">
            <p>
              <strong>{post.user.username}</strong> {post.caption}
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