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
          <div className="comment" key={comment._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, flex: 1 }}>
              <Avatar
                src={comment.user.profilePicture}
                alt="Avatar"
                className="comment-avatar"
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{comment.user.username}</strong>
                  <VerifiedBadge show={comment.user.isVerified} />
                </div>
                {editingCommentId === comment._id ? (
                  <div style={{ marginTop: 'var(--space-1)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="comment-edit-input"
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                    />
                    <button className="delete-btn" style={{ color: 'var(--accent)', flexShrink: 0 }} onClick={() => handleSaveEditComment(post._id, comment._id)}>
                      Save
                    </button>
                    <button className="delete-btn" style={{ flexShrink: 0 }} onClick={() => setEditingCommentId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span style={{ marginLeft: 0, marginTop: '2px', wordBreak: 'break-word' }}>{comment.content}</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
              <button className="delete-btn" style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-xs)' }} onClick={() => handleLikeComment(post._id, comment._id)}>
                {comment.likes?.includes(user?.id) ? '❤️' : '🤍'}
                <span style={{ fontSize: 'var(--text-xs)', marginLeft: '2px' }}>{comment.likes?.length || 0}</span>
              </button>
              {editingCommentId !== comment._id && user && user.id === comment.user._id && (
                <button className="delete-btn" style={{ color: 'var(--accent)' }} onClick={() => handleStartEditComment(comment)}>
                  Edit
                </button>
              )}
              {user && (user.id === comment.user._id || user.id === post.user._id) && (
                <button className="delete-btn" style={{ fontSize: 'var(--text-base)' }} onClick={() => handleDeleteComment(post._id, comment._id)}>
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
          <button type="submit" disabled={!commentInputs[post._id]?.trim()}>Post</button>
        </form>
      )}
    </>
  );
};

export default CommentSection;