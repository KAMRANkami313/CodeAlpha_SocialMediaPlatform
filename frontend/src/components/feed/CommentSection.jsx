import { useState, useEffect } from 'react';
import { postService } from '../../services/postService';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const CommentItem = ({ comment, post, user, onCommentsUpdated, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  const fetchReplies = async () => {
    try {
      const res = await postService.getReplies(post._id, comment._id);
      setReplies(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      await fetchReplies();
    }
    setShowReplies(!showReplies);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await postService.addComment(post._id, replyText, comment._id);
      setReplyText('');
      setShowReplyForm(false);
      await fetchReplies();
      setShowReplies(true);
      onCommentsUpdated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postService.deleteComment(post._id, commentId);
      onCommentsUpdated();
      if (depth > 0) {
        await fetchReplies();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await postService.likeUnlikeComment(post._id, commentId);
      onCommentsUpdated();
      if (showReplies) {
        await fetchReplies();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentText(comment.content);
  };

  const handleSaveEditComment = async (commentId) => {
    try {
      await postService.updateComment(post._id, commentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText('');
      onCommentsUpdated();
      if (showReplies) {
        await fetchReplies();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="comment-thread">
      <div className="comment" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                <button className="delete-btn" style={{ color: 'var(--accent)', flexShrink: 0 }} onClick={() => handleSaveEditComment(comment._id)}>
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
          <button className="delete-btn" style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-xs)' }} onClick={() => handleLikeComment(comment._id)}>
            {comment.likes?.includes(user?.id) ? '❤️' : '🤍'}
            <span style={{ fontSize: 'var(--text-xs)', marginLeft: '2px' }}>{comment.likes?.length || 0}</span>
          </button>
          {editingCommentId !== comment._id && user && (
            <button className="delete-btn" style={{ color: 'var(--accent)' }} onClick={() => handleStartEditComment(comment)}>
              Edit
            </button>
          )}
          {user && user.id === comment.user._id && editingCommentId !== comment._id && (
            <button className="delete-btn" style={{ fontSize: 'var(--text-base)' }} onClick={() => handleDeleteComment(comment._id)}>
              ×
            </button>
          )}
        </div>
      </div>

      <div className="comment-actions-bar">
        <button className="delete-btn" style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)' }} onClick={() => setShowReplyForm(!showReplyForm)}>
          Reply
        </button>
        {depth === 0 && (
          <button className="delete-btn" style={{ fontSize: 'var(--text-xs)' }} onClick={handleToggleReplies}>
            {showReplies ? 'Hide replies' : `View replies${replies.length > 0 ? ` (${replies.length})` : ''}`}
          </button>
        )}
      </div>

      {showReplyForm && (
        <form className="comment-reply-form" onSubmit={handleReplySubmit}>
          <input
            type="text"
            placeholder={`Reply to ${comment.user.username}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
          />
          <button type="submit">Reply</button>
        </form>
      )}

      {showReplies && depth === 0 && (
        <div className="comment-replies">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              post={post}
              user={user}
              onCommentsUpdated={onCommentsUpdated}
              depth={depth + 1}
            />
          ))}
          {replies.length === 0 && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--secondary-text)', padding: 'var(--space-2) 0' }}>
              No replies yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ post, user, onCommentsUpdated }) => {
  const [commentInputs, setCommentInputs] = useState({});

  const topLevelComments = post.comments.filter(c => !c.parentComment);

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

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  return (
    <>
      <div className="comment-section">
        {topLevelComments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            post={post}
            user={user}
            onCommentsUpdated={onCommentsUpdated}
            depth={0}
          />
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