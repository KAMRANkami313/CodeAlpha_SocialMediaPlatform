import { useState } from 'react';
import { postService } from '../../services/postService';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const CommentSection = ({ post, user, onCommentsUpdated }) => {
  const [commentInputs, setCommentInputs] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const content = commentInputs[postId];
    if (!content) return;
    try {
      await postService.addComment(postId, content);
      setCommentInputs({ ...commentInputs, [postId]: '' });
      onCommentsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await postService.deleteComment(postId, commentId);
      onCommentsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      await postService.likeUnlikeComment(postId, commentId);
      onCommentsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.content);
  };

  const handleSaveEditComment = async (postId, commentId) => {
    try {
      await postService.updateComment(postId, commentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText('');
      onCommentsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  return (
    <>
      <div className="comment-section">
        {post.comments.map((comment) => (
          <div className="comment" key={comment._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={comment.user.profilePicture}
                alt="Avatar"
                className="post-avatar"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <strong>{comment.user.username}</strong>
                <VerifiedBadge show={comment.user.isVerified} />
                {editingCommentId === comment._id ? (
                  <div style={{ marginLeft: '10px', display: 'flex', gap: '5px' }}>
                    <input
                      type="text"
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      style={{ padding: '2px 5px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                    />
                    <button className="delete-btn" style={{ color: '#0095f6', fontSize: '11px' }} onClick={() => handleSaveEditComment(post._id, comment._id)}>
                      Save
                    </button>
                    <button className="delete-btn" style={{ fontSize: '11px' }} onClick={() => setEditingCommentId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span style={{ marginLeft: '8px' }}>{comment.content}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button className="delete-btn" style={{ fontSize: '12px' }} onClick={() => handleLikeComment(post._id, comment._id)}>
                {comment.likes?.includes(user?.id) ? '❤️' : '🤍'}
                <span style={{ fontSize: '10px', marginLeft: '3px' }}>{comment.likes?.length || 0}</span>
              </button>
              {editingCommentId !== comment._id && user && user.id === comment.user._id && (
                <button className="delete-btn" style={{ fontSize: '12px', color: '#0095f6' }} onClick={() => handleStartEditComment(comment)}>
                  Edit
                </button>
              )}
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
            id={`comment-input-${post._id}`}
            type="text"
            placeholder="Add a comment..."
            value={commentInputs[post._id] || ''}
            onChange={(e) => handleCommentChange(post._id, e.target.value)}
            required
          />
          <button type="submit">Post</button>
        </form>
      )}
    </>
  );
};

export default CommentSection;