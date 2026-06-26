import { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import ProfileEditForm from './ProfileEditForm';
import SettingsModal from './SettingsModal';
import BlockedUsersModal from './BlockedUsersModal';
import { blockService } from '../../services/blockService';

const ProfileHeader = ({
  profile,
  posts,
  user,
  isMe,
  isFollowing,
  editing,
  onEdit,
  onCancelEdit,
  onFollowUnfollow,
  onMessage,
  onOpenUserList,
  setUser,
  onProfileUpdated,
  onAccountDeleted
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [blockStatus, setBlockStatus] = useState({ isBlocked: false, blockedByMe: false });

  useEffect(() => {
    if (user && !isMe) {
      blockService.checkBlockStatus(profile._id)
        .then(res => setBlockStatus(res.data))
        .catch(() => {});
    }
  }, [profile._id, user, isMe]);

  const handleBlock = async () => {
    try {
      await blockService.blockUser(profile._id);
      setBlockStatus({ isBlocked: true, blockedByMe: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblock = async () => {
    try {
      await blockService.unblockUser(profile._id);
      setBlockStatus({ isBlocked: false, blockedByMe: false });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-avatar-wrapper">
        <Avatar
          src={profile.profilePicture}
          alt="Profile Avatar"
          className="profile-avatar"
        />
      </div>
      <div className="profile-info">
        <h2>
          {profile.username}
          <VerifiedBadge show={profile.isVerified} />
          {user && !isMe && (
            <div className="profile-action-buttons">
              {!blockStatus.isBlocked && (
                <>
                  <button className="btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)' }} onClick={onFollowUnfollow}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                  <button className="btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={onMessage}>
                    Message
                  </button>
                </>
              )}
              {blockStatus.blockedByMe ? (
                <button className="btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={handleUnblock}>
                  Unblock
                </button>
              ) : (
                <button className="btn settings-danger-btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)' }} onClick={handleBlock}>
                  Block
                </button>
              )}
            </div>
          )}
        </h2>
        <div className="profile-stats">
          <span><strong>{posts.length}</strong> posts</span>
          <span
            className={profile.followers.length > 0 ? 'likes-trigger' : ''}
            onClick={() => onOpenUserList(profile.followers, 'Followers')}
          >
            <strong>{profile.followers.length}</strong> followers
          </span>
          <span
            className={profile.following.length > 0 ? 'likes-trigger' : ''}
            onClick={() => onOpenUserList(profile.following, 'Following')}
          >
            <strong>{profile.following.length}</strong> following
          </span>
          {isMe && (
            <span style={{ color: 'var(--secondary-text)' }}>
              <strong>{profile.views?.length || 0}</strong> views
            </span>
          )}
        </div>
        {editing ? (
          <ProfileEditForm
            initialProfile={profile}
            savedPosts={user.savedPosts}
            setUser={setUser}
            onCancel={onCancelEdit}
            onUpdated={onProfileUpdated}
          />
        ) : (
          <div className="profile-bio">
            <p>{profile.bio || 'No bio yet.'}</p>
            {isMe && (
              <div className="profile-action-buttons">
                <button className="btn" style={{ width: 'auto', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={onEdit}>Edit Profile</button>
                <button className="btn" style={{ width: 'auto', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={() => setShowSettings(true)}>Settings</button>
                <button className="btn" style={{ width: 'auto', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={() => setShowBlocked(true)}>Blocked Users</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onAccountDeleted={onAccountDeleted}
        />
      )}

      {showBlocked && (
        <BlockedUsersModal onClose={() => setShowBlocked(false)} />
      )}
    </div>
  );
};

export default ProfileHeader;