import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import ProfileEditForm from './ProfileEditForm';

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
  onProfileUpdated
}) => {
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
              <button className="btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)' }} onClick={onFollowUnfollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button className="btn" style={{ width: 'auto', padding: 'var(--space-2) var(--space-5)', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={onMessage}>
                Message
              </button>
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
              <button className="btn" style={{ width: 'auto', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={onEdit}>Edit Profile</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;