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
      <Avatar
        src={profile.profilePicture}
        alt="Profile Avatar"
        className="profile-avatar"
      />
      <div className="profile-info">
        <h2 style={{ display: 'flex', alignItems: 'center' }}>
          {profile.username}
          <VerifiedBadge show={profile.isVerified} />
          {user && !isMe && (
            <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
              <button className="btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={onFollowUnfollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button className="btn" style={{ width: 'auto', padding: '5px 15px', backgroundColor: '#dbdbdb', color: '#000' }} onClick={onMessage}>
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
            <span style={{ fontSize: '14px', color: 'var(--secondary-text)' }}>
              🔒 <strong>{profile.views?.length || 0}</strong> views
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
              <button className="btn" style={{ width: 'auto', padding: '5px 15px', backgroundColor: '#dbdbdb', color: '#000' }} onClick={onEdit}>Edit Profile</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;