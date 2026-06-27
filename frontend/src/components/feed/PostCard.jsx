import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';
import { ACTIVITY_THRESHOLD_MS } from '../../utils/constants';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import PostViewTracker from './PostViewTracker';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';
import SharePostModal from './SharePostModal';
import {
  Heart,
  MessageCircle,
  Link2,
  Send,
  Bookmark,
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Flag
} from 'lucide-react';

const evaluateActivityStatus = (lastActivityDate) => {
  if (!lastActivityDate) return false;
  const difference = Date.now() - new Date(lastActivityDate).getTime();
  return difference < ACTIVITY_THRESHOLD_MS;
};

const PostCard = ({
  post,
  user,
  setUser,
  onPostUpdated,
  onShare,
  onShareToDM,
  onTagClick,
  setActiveLikers,
  onArchiveToggle
}) => {
  const [editingPostId, setEditingPostId] = useState(null);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [visibleComments, setVisibleComments] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleShareLink = (postId) => {
    onShare(postId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleArchiveToggle = async (postId) => {
    setShowMenu(false);
    try {
      if (post.isArchived) {
        await postService.unarchivePost(postId);
      } else {
        await postService.archivePost(postId);
      }
      if (onArchiveToggle) {
        onArchiveToggle(postId);
      } else {
        onPostUpdated();
      }
    } catch (error) {
      console.error(error);
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
  const isOwnPost = user && user.id === post.user._id;
  const isSaved = user?.savedPosts?.includes(post._id);

  return (
    <div className={`post-card ${post.isArchived ? 'post-card-archived' : ''}`}>
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
          {post.isArchived && (
            <span className="archived-pill" title="This post is archived">Archived</span>
          )}
        </div>
        {isOwnPost ? (
          <div className="post-header-actions">
            <button className="post-action-btn edit" onClick={() => handleStartEdit(post)} aria-label="Edit post" title="Edit post">
              <Pencil size={16} />
            </button>
            <button className="post-action-btn delete" onClick={() => handleDeletePost(post._id)} aria-label="Delete post" title="Delete post">
              <Trash2 size={16} />
            </button>
            <div className="post-menu-container" ref={menuRef}>
              <button
                className="post-action-btn"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Post options"
                aria-expanded={showMenu}
                title="More options"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div className="post-menu-dropdown">
                  <button
                    className="post-menu-item"
                    onClick={() => handleArchiveToggle(post._id)}
                  >
                    {post.isArchived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
                    {post.isArchived ? 'Unarchive Post' : 'Archive Post'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          user && (
            <div className="post-menu-container" ref={menuRef}>
              <button
                className="post-action-btn"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Post options"
                aria-expanded={showMenu}
                title="More options"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <div className="post-menu-dropdown">
                  <button
                    className="post-menu-item post-menu-danger"
                    onClick={() => {
                      setShowMenu(false);
                      setShowReport(true);
                    }}
                  >
                    <Flag size={15} />
                    Report Post
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
      {post.image && <img src={post.image} alt="Post content" className="post-image" />}
      <div className="post-actions" style={{ justifyContent: 'space-between' }}>
        <div className="post-action-group">
          <button
            className={`post-action-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => handleLike(post._id)}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <span className="likes-trigger" onClick={() => setActiveLikers(post.likes)}>
            {post.likes.length} likes
          </span>
          <button
            className="post-action-btn"
            onClick={() => handleToggleComments(post._id)}
            aria-label="Comments"
            title="Comments"
          >
            <MessageCircle size={20} />
          </button>
          <span className="post-action-info">
            {post.comments.length} comments
          </span>
          <button
            className={`post-action-btn ${copied ? 'copied' : ''}`}
            onClick={() => handleShareLink(post._id)}
            aria-label="Copy link"
            title="Copy link"
          >
            <Link2 size={18} />
          </button>
          {onShareToDM && (
            <button
              className="post-action-btn"
              onClick={() => setShowShare(true)}
              aria-label="Share via DM"
              title="Share via DM"
            >
              <Send size={18} />
            </button>
          )}
          <span className="post-action-info views">
            <Eye size={14} />
            {post.views?.length || 0}
          </span>
        </div>
        {user && (
          <button
            className={`post-action-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => handleSave(post._id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save post'}
            title={isSaved ? 'Remove from saved' : 'Save post'}
          >
            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      {copied && (
        <div className="post-copied-toast">Link copied!</div>
      )}
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
            <div className="post-edit-actions">
              <button className="btn post-edit-save" onClick={() => handleSaveEdit(post._id)}>
                Save
              </button>
              <button className="btn post-edit-cancel" onClick={() => setEditingPostId(null)}>
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

      {showReport && (
        <ReportModal postId={post._id} onClose={() => setShowReport(false)} />
      )}

      {showShare && (
        <SharePostModal
          post={post}
          onClose={() => setShowShare(false)}
          onSelectUser={async (u) => {
            await onShareToDM(post, u);
            setShowShare(false);
          }}
        />
      )}
    </div>
  );
};

export default PostCard;