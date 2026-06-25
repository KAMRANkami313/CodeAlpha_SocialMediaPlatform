import { useState } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';
import { ACTIVITY_THRESHOLD_MS } from '../../utils/constants';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import PostViewTracker from './PostViewTracker';
import CommentSection from './CommentSection';

const evaluateActivityStatus = (lastActivityDate) => {
  if (!lastActivityDate) return false;
  const difference = Date.now() - new Date(lastActivityDate).getTime();
  return difference < ACTIVITY_THRESHOLD_MS;
};

const PostCard = ({ post, user, setUser, onPostUpdated, onShare, onTagClick, setActiveLikers }) => {
  const [editingPostId, setEditingPostId] = useState(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [visibleComments, setVisibleComments] = useState({});

  const handleLike = async (postId) => {
    try {
      await postService.likeUnlikePost(postId);
      onPostUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (postId) => {
    try {
      const response = await userService.savePost(postId);
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
      await postService.deletePost(postId);
      onPostUpdated();
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
      await postService.updatePost(postId, editCaptionText);
      setEditingPostId(null);
      setEditCaptionText('');
      onPostUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComments = (postId) => {
    const isCurrentlyVisible = visibleComments[postId];
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    if (!isCurrentlyVisible) {
      setTimeout(() => {
        const inputElement = document.getElementById(`comment-input-${postId}`);
        if (inputElement) {
          inputElement.focus();
          inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
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
            onClick={() => onTagClick(cleanTag)}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const isLiked = post.likes.some(l => l._id === user?.id);

  return (
    <div className="post-card">
      {user && <PostViewTracker postId={post._id} />}
      <div className="post-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="avatar-container">
            <Avatar
              src={post.user.profilePicture}
              alt="Avatar"
              className="post-avatar"
            />
            {evaluateActivityStatus(post.user.lastActivityTimestamp) && (
              <span className="activity-indicator-dot"></span>
            )}
          </div>
          <Link to={`/profile/${post.user._id}`} style={{ display: 'flex', alignItems: 'center' }}>
            {post.user.username}
            <VerifiedBadge show={post.user.isVerified} />
          </Link>
        </div>
        {user && user.id === post.user._id && (
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <button className="delete-btn" style={{ color: 'var(--accent)' }} onClick={() => handleStartEdit(post)}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={() => handleLike(post._id)}>
            {isLiked ? '❤️' : '🤍'}
          </button>
          <span className="likes-trigger" onClick={() => setActiveLikers(post.likes)}>
            {post.likes.length} likes
          </span>
          <button className="like-btn" onClick={() => handleToggleComments(post._id)}>
            💬
          </button>
          <span className="post-action-info">
            {post.comments.length} comments
          </span>
          <button className="like-btn" onClick={() => onShare(post._id)}>
            🔗
          </button>
          <span className="post-action-info">
            👁️ {post.views?.length || 0} views
          </span>
        </div>
        {user && (
          <button
            className="like-btn"
            onClick={() => handleSave(post._id)}
          >
            {user.savedPosts?.includes(post._id) ? '🔖' : '📁'}
          </button>
        )}
      </div>
      <div className="post-content">
        {editingPostId === post._id ? (
          <div>
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <textarea
                value={editCaptionText}
                onChange={(e) => setEditCaptionText(e.target.value)}
                rows="2"
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)' }} onClick={() => handleSaveEdit(post._id)}>
                Save
              </button>
              <button className="btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={() => setEditingPostId(null)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p>
            <strong>{post.user.username}</strong> {renderCaption(post.caption)}
          </p>
        )}
      </div>
      {visibleComments[post._id] && (
        <CommentSection post={post} user={user} onCommentsUpdated={onPostUpdated} />
      )}
    </div>
  );
};

export default PostCard;