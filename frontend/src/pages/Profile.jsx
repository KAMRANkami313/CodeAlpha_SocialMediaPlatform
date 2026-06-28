import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import { storyService } from '../services/storyService';
import Avatar from '../components/common/Avatar';
import VerifiedBadge from '../components/common/VerifiedBadge';
import LikersModal from '../components/common/LikersModal';
import UserListModal from '../components/common/UserListModal';
import EmptyState from '../components/common/EmptyState';
import { ProfileSkeleton } from '../components/common/Skeleton';
import ProfileHeader from '../components/profile/ProfileHeader';
import CreateHighlightModal from '../components/profile/CreateHighlightModal';
import {
  FileText,
  Bookmark,
  Archive as ArchiveIcon,
  Clock,
  Send,
  Trash2,
  Calendar,
  X,
  Star,
  ArchiveRestore
} from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser, logoutUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [archivedPosts, setArchivedPosts] = useState([]);
  const [draftPosts, setDraftPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [statusMessage, setStatusMessage] = useState('');

  const [activeLikers, setActiveLikers] = useState(null);
  const [userListModal, setUserListModal] = useState(null);
  const [userListTitle, setUserListTitle] = useState('');
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [showCreateHighlight, setShowCreateHighlight] = useState(false);

  const showStatus = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleHighlightCreated = async () => {
    setShowCreateHighlight(false);
    try {
      const res = await storyService.getHighlights(id);
      setHighlights(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteHighlight = async (highlightId) => {
    if (!window.confirm('Delete this highlight?')) return;
    try {
      await storyService.deleteHighlight(highlightId);
      setHighlights(prev => prev.filter(h => h._id !== highlightId));
      setActiveHighlight(null);
      showStatus('Highlight deleted');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const resProfile = await userService.getProfile(id);
      setProfile(resProfile.data);
      const resPosts = await postService.getUserPosts(id);
      setPosts(resPosts.data);
      const resHighlights = await storyService.getHighlights(id).catch(() => ({ data: [] }));
      setHighlights(resHighlights.data || []);
      if (user && id === user.id) {
        const resArchived = await postService.getArchivedPosts().catch(() => ({ data: [] }));
        setArchivedPosts(resArchived.data || []);
        const resDrafts = await postService.getDrafts().catch(() => ({ data: [] }));
        setDraftPosts(resDrafts.data || []);
        const resScheduled = await postService.getScheduledPosts().catch(() => ({ data: [] }));
        setScheduledPosts(resScheduled.data || []);
      } else {
        setArchivedPosts([]);
        setDraftPosts([]);
        setScheduledPosts([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setProfile(null);
    fetchProfile();
    setActiveTab('posts');
    setUserListModal(null);
  }, [id, user?.id]);

  const handleFollowUnfollow = async () => {
    const isFollowing = profile.followers.some(f => f._id === user.id);
    try {
      if (isFollowing) {
        await userService.unfollow(id);
      } else {
        await userService.follow(id);
      }
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageUser = () => {
    navigate('/messages', { state: { startChatWith: profile } });
  };

  const handleAccountDeleted = () => {
    logoutUser();
    navigate('/');
  };

  const handleOpenUserList = (list, title) => {
    if (list.length === 0) return;
    setUserListModal(list);
    setUserListTitle(title);
  };

  const handlePublishDraft = async (postId) => {
    try {
      await postService.publishDraft(postId);
      setDraftPosts(prev => prev.filter(p => p._id !== postId));
      fetchProfile();
      showStatus('Draft published!');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishScheduled = async (postId) => {
    try {
      await postService.publishDraft(postId);
      setScheduledPosts(prev => prev.filter(p => p._id !== postId));
      fetchProfile();
      showStatus('Post published!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelSchedule = async (postId) => {
    try {
      await postService.cancelSchedule(postId);
      const moved = scheduledPosts.find(p => p._id === postId);
      setScheduledPosts(prev => prev.filter(p => p._id !== postId));
      if (moved) {
        setDraftPosts(prev => [{ ...moved, isDraft: true, scheduledAt: null }, ...prev]);
      }
      showStatus('Moved to drafts');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDraft = async (postId) => {
    if (!window.confirm('Delete this draft permanently?')) return;
    try {
      await postService.deletePost(postId);
      setDraftPosts(prev => prev.filter(p => p._id !== postId));
      showStatus('Draft deleted');
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <Navigate to="/login" replace />;
  if (!profile) {
    return (
      <div className="container" style={{ maxWidth: '1024px' }}>
        <ProfileSkeleton />
      </div>
    );
  }

  const isMe = user?.id === profile._id;
  const isFollowing = profile.followers.some(f => f._id === user?.id);

  let displayedPosts;
  if (activeTab === 'posts') displayedPosts = posts;
  else if (activeTab === 'saved') displayedPosts = profile.savedPosts || [];
  else if (activeTab === 'archived') displayedPosts = archivedPosts;

  return (
    <div className="container" style={{ maxWidth: '1024px' }}>
      {statusMessage && (
        <div className="profile-status-toast">
          {statusMessage}
        </div>
      )}

      <ProfileHeader
        profile={profile}
        posts={posts}
        user={user}
        isMe={isMe}
        isFollowing={isFollowing}
        editing={editing}
        onEdit={() => setEditing(true)}
        onCancelEdit={() => setEditing(false)}
        onFollowUnfollow={handleFollowUnfollow}
        onMessage={handleMessageUser}
        onOpenUserList={handleOpenUserList}
        setUser={setUser}
        onProfileUpdated={fetchProfile}
        onAccountDeleted={handleAccountDeleted}
      />

      {(highlights.length > 0 || isMe) && (
        <div className="highlights-row">
          {isMe && (
            <button
              className="highlight-circle highlight-circle-new"
              onClick={() => setShowCreateHighlight(true)}
              title="Create new highlight"
            >
              <span className="highlight-circle-plus">+</span>
              <span className="highlight-circle-title">New</span>
            </button>
          )}
          {highlights.map((h) => (
            <button
              key={h._id}
              className="highlight-circle"
              onClick={() => setActiveHighlight(h)}
              title={h.title}
            >
              {h.image ? (
                <img src={h.image} alt={h.title} className="highlight-circle-img" />
              ) : (
                <span className="highlight-circle-placeholder">
                  <Star size={24} fill="currentColor" />
                </span>
              )}
              <span className="highlight-circle-title">{h.title || 'Untitled'}</span>
            </button>
          ))}
          {isMe && highlights.length === 0 && (
            <div className="highlights-empty">
              Tap "New" to save your first story highlight. Highlights stay on your profile permanently.
            </div>
          )}
        </div>
      )}

      {isMe && (
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            My Posts
          </button>
          <button
            className={`profile-tab ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            Drafts
            {(draftPosts.length + scheduledPosts.length) > 0 && (
              <span className="profile-tab-count">{draftPosts.length + scheduledPosts.length}</span>
            )}
          </button>
          <button
            className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Posts
          </button>
          <button
            className={`profile-tab ${activeTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveTab('archived')}
          >
            Archived
            {archivedPosts.length > 0 && (
              <span className="profile-tab-count">{archivedPosts.length}</span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'drafts' && isMe ? (
        <div className="profile-posts-grid">
          {scheduledPosts.length === 0 && draftPosts.length === 0 && (
            <EmptyState
              icon={<Clock size={48} />}
              title="No drafts or scheduled posts"
              message="Save a post as a draft or schedule it for later — it'll appear here."
            />
          )}
          {scheduledPosts.map((post) => (
            <div className="post-card post-card-scheduled" key={`scheduled-${post._id}`}>
              <div className="post-header">
                <Avatar src={post.user.profilePicture} alt="Avatar" className="post-avatar" />
                <strong style={{ display: 'flex', alignItems: 'center' }}>
                  {post.user.username}
                  <VerifiedBadge show={post.user.isVerified} />
                </strong>
                <span className="scheduled-pill">
                  <Calendar size={11} />
                  {new Date(post.scheduledAt).toLocaleString()}
                </span>
              </div>
              {post.image && <img src={post.image} alt="Post content" className="post-image" />}
              <div className="post-content">
                <p>{post.caption || '(no caption)'}</p>
              </div>
              <div className="draft-post-actions">
                <button className="btn draft-publish-btn" onClick={() => handlePublishScheduled(post._id)}>
                  <Send size={14} />
                  Publish Now
                </button>
                <button className="btn draft-cancel-btn" onClick={() => handleCancelSchedule(post._id)}>
                  <ArchiveRestore size={14} />
                  Move to Drafts
                </button>
              </div>
            </div>
          ))}
          {draftPosts.map((post) => (
            <div className="post-card post-card-draft" key={`draft-${post._id}`}>
              <div className="post-header">
                <Avatar src={post.user.profilePicture} alt="Avatar" className="post-avatar" />
                <strong style={{ display: 'flex', alignItems: 'center' }}>
                  {post.user.username}
                  <VerifiedBadge show={post.user.isVerified} />
                </strong>
                <span className="draft-pill">Draft</span>
              </div>
              {post.image && <img src={post.image} alt="Post content" className="post-image" />}
              <div className="post-content">
                <p>{post.caption || '(no caption)'}</p>
              </div>
              <div className="draft-post-actions">
                <button className="btn draft-publish-btn" onClick={() => handlePublishDraft(post._id)}>
                  <Send size={14} />
                  Publish
                </button>
                <button className="btn draft-delete-btn" onClick={() => handleDeleteDraft(post._id)}>
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-posts-grid">
          {displayedPosts.length === 0 && (
            <EmptyState
              icon={
                activeTab === 'saved' ? <Bookmark size={48} />
                : activeTab === 'archived' ? <ArchiveIcon size={48} />
                : <FileText size={48} />
              }
              title={
                activeTab === 'saved' ? 'No saved posts'
                : activeTab === 'archived' ? 'No archived posts'
                : 'No posts yet'
              }
              message={
                activeTab === 'saved' ? 'Posts you save will appear here.'
                : activeTab === 'archived' ? 'Posts you archive will appear here. They stay hidden from your feed and profile.'
                : 'When this user shares posts, they will appear here.'
              }
            />
          )}
          {displayedPosts.map((post, index) => (
            <div className="post-card" key={`${activeTab}-${post._id}-${index}`}>
              <div className="post-header">
                <Avatar src={post.user.profilePicture} alt="Avatar" className="post-avatar" />
                <strong style={{ display: 'flex', alignItems: 'center' }}>
                  {post.user.username}
                  <VerifiedBadge show={post.user.isVerified} />
                </strong>
                {post.isArchived && <span className="archived-pill">Archived</span>}
              </div>
              {post.image && <img src={post.image} alt="Post content" className="post-image" />}
              <div className="post-actions" style={{ padding: 'var(--space-3) var(--space-4) 0 var(--space-4)' }}>
                <span className="likes-trigger" onClick={() => setActiveLikers(post.likes)}>
                  {post.likes.length} likes
                </span>
              </div>
              <div className="post-content">
                <p>{post.caption}</p>
              </div>
              {isMe && activeTab === 'archived' && (
                <div className="archived-post-actions">
                  <button
                    className="btn archived-restore-btn"
                    onClick={async () => {
                      try {
                        await postService.unarchivePost(post._id);
                        setArchivedPosts(prev => prev.filter(p => p._id !== post._id));
                        fetchProfile();
                      } catch (err) { console.error(err); }
                    }}
                  >
                    <ArchiveRestore size={14} />
                    Restore
                  </button>
                  <button
                    className="btn settings-danger-btn archived-delete-btn"
                    onClick={async () => {
                      if (!window.confirm('Permanently delete this post?')) return;
                      try {
                        await postService.deletePost(post._id);
                        setArchivedPosts(prev => prev.filter(p => p._id !== post._id));
                      } catch (err) { console.error(err); }
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeLikers && (
        <LikersModal likers={activeLikers} onClose={() => setActiveLikers(null)} />
      )}

      {userListModal && (
        <UserListModal
          title={userListTitle}
          users={userListModal}
          onClose={() => setUserListModal(null)}
        />
      )}

      {activeHighlight && (
        <div className="highlight-viewer" onClick={() => setActiveHighlight(null)}>
          <button
            className="highlight-viewer-close"
            onClick={() => setActiveHighlight(null)}
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <div className="highlight-viewer-content" onClick={(e) => e.stopPropagation()}>
            {activeHighlight.image ? (
              <img src={activeHighlight.image} alt={activeHighlight.title} className="highlight-viewer-img" />
            ) : (
              <div className="highlight-viewer-placeholder">No image</div>
            )}
            <div className="highlight-viewer-title">{activeHighlight.title || 'Untitled'}</div>
            {isMe && (
              <button
                className="btn settings-danger-btn highlight-viewer-delete"
                onClick={() => handleDeleteHighlight(activeHighlight._id)}
              >
                Delete Highlight
              </button>
            )}
          </div>
        </div>
      )}

      {showCreateHighlight && (
        <CreateHighlightModal
          onClose={() => setShowCreateHighlight(false)}
          onCreated={handleHighlightCreated}
        />
      )}
    </div>
  );
};

export default Profile;