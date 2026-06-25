import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [profilePicInput, setProfilePicInput] = useState('');
  const [isVerifiedInput, setIsVerifiedInput] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [error, setError] = useState('');

  const [activeLikers, setActiveLikers] = useState(null);
  const [userListModal, setUserListModal] = useState(null);
  const [userListTitle, setUserListTitle] = useState('');

  const fetchProfile = async () => {
    try {
      const resProfile = await API.get(`/users/profile/${id}`);
      setProfile(resProfile.data);
      setUsernameInput(resProfile.data.username);
      setEmailInput(resProfile.data.email);
      setBioInput(resProfile.data.bio);
      setProfilePicInput(resProfile.data.profilePicture);
      setIsVerifiedInput(resProfile.data.isVerified);
      const resPosts = await API.get(`/posts/user/${id}`);
      setPosts(resPosts.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    setActiveTab('posts');
    setUserListModal(null);
  }, [id]);

  const handleFollowUnfollow = async () => {
    const isFollowing = profile.followers.some(f => f._id === user.id);
    try {
      if (isFollowing) {
        await API.post(`/users/unfollow/${id}`);
      } else {
        await API.post(`/users/follow/${id}`);
      }
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await API.put('/users/profile', {
        username: usernameInput,
        email: emailInput,
        bio: bioInput,
        profilePicture: profilePicInput,
        isVerified: isVerifiedInput
      });

      const updatedUser = {
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        bio: response.data.bio,
        profilePicture: response.data.profilePicture,
        isVerified: response.data.isVerified,
        savedPosts: user.savedPosts
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
    }
  };

  const handleMessageUser = () => {
    navigate('/messages', { state: { startChatWith: profile } });
  };

  const handleOpenUserList = (list, title) => {
    if (list.length === 0) return;
    setUserListModal(list);
    setUserListTitle(title);
  };

  if (!profile) return <div className="container">Loading profile...</div>;

  const isMe = user?.id === profile._id;
  const isFollowing = profile.followers.some(f => f._id === user?.id);
  const displayedPosts = activeTab === 'posts' ? posts : profile.savedPosts;

  return (
    <div className="container">
      <div className="profile-header">
        {profile.profilePicture ? (
          <img
            src={profile.profilePicture}
            alt="Profile Avatar"
            className="profile-avatar"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="profile-avatar"></div>
        )}
        <div className="profile-info">
          <h2 style={{ display: 'flex', alignItems: 'center' }}>
            {profile.username}
            {profile.isVerified && <span className="verified-badge">✓</span>}
            {user && !isMe && (
              <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                <button className="btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleFollowUnfollow}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button className="btn" style={{ width: 'auto', padding: '5px 15px', backgroundColor: '#dbdbdb', color: '#000' }} onClick={handleMessageUser}>
                  Message
                </button>
              </div>
            )}
          </h2>
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span
              className={profile.followers.length > 0 ? 'likes-trigger' : ''}
              onClick={() => handleOpenUserList(profile.followers, 'Followers')}
            >
              <strong>{profile.followers.length}</strong> followers
            </span>
            <span
              className={profile.following.length > 0 ? 'likes-trigger' : ''}
              onClick={() => handleOpenUserList(profile.following, 'Following')}
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
            <form onSubmit={handleUpdateProfile}>
              {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Profile Picture URL"
                  value={profilePicInput}
                  onChange={(e) => setProfilePicInput(e.target.value)}
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Bio"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={isVerifiedInput}
                  onChange={(e) => setIsVerifiedInput(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <label style={{ fontSize: '14px' }}>Request Verification Checkmark Badge</label>
              </div>
              <button type="submit" className="btn" style={{ width: 'auto', marginRight: '10px' }}>Save Changes</button>
              <button type="button" className="btn" style={{ width: 'auto', backgroundColor: '#dbdbdb', color: '#000' }} onClick={() => setEditing(false)}>Cancel</button>
            </form>
          ) : (
            <div className="profile-bio">
              <p>{profile.bio || 'No bio yet.'}</p>
              {isMe && (
                <button className="btn" style={{ width: 'auto', padding: '5px 15px', backgroundColor: '#dbdbdb', color: '#000' }} onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>
          )}
        </div>
      </div>

      {isMe && (
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            My Posts
          </button>
          <button
            className={`profile-tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Posts
          </button>
        </div>
      )}

      {displayedPosts.map((post) => (
        <div className="post-card" key={post._id}>
          <div className="post-header">
            {post.user.profilePicture ? (
              <img
                src={post.user.profilePicture}
                alt="Avatar"
                className="post-avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="post-avatar"></div>
            )}
            <strong style={{ display: 'flex', alignItems: 'center' }}>
              {post.user.username}
              {post.user.isVerified && <span className="verified-badge">✓</span>}
            </strong>
          </div>
          {post.image && <img src={post.image} alt="Post content" className="post-image" />}
          <div className="post-actions" style={{ padding: '15px 15px 0 15px' }}>
            <span className="likes-trigger" onClick={() => setActiveLikers(post.likes)}>
              {post.likes.length} likes
            </span>
          </div>
          <div className="post-content">
            <p>{post.caption}</p>
          </div>
        </div>
      ))}

      {activeLikers && (
        <div className="modal-overlay" onClick={() => setActiveLikers(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Likes</span>
              <button className="modal-close-btn" onClick={() => setActiveLikers(null)}>×</button>
            </div>
            <div className="modal-body">
              {activeLikers.map((liker) => (
                <div key={liker._id} className="suggestion-item" style={{ marginBottom: '15px' }}>
                  <div className="suggestion-info">
                    {liker.profilePicture ? (
                      <img
                        src={liker.profilePicture}
                        alt="Avatar"
                        className="suggestion-avatar"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="suggestion-avatar" style={{ width: '32px', height: '32px' }}></div>
                    )}
                    <Link
                      to={`/profile/${liker._id}`}
                      className="suggestion-username"
                      style={{ display: 'flex', alignItems: 'center' }}
                      onClick={() => setActiveLikers(null)}
                    >
                      {liker.username}
                      {liker.isVerified && <span className="verified-badge">✓</span>}
                    </Link>
                  </div>
                </div>
              ))}
              {activeLikers.length === 0 && (
                <div style={{ textAlign: 'center', color: '#8e8e8e', fontSize: '14px' }}>No likes yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {userListModal && (
        <div className="modal-overlay" onClick={() => setUserListModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{userListTitle}</span>
              <button className="modal-close-btn" onClick={() => setUserListModal(null)}>×</button>
            </div>
            <div className="modal-body">
              {userListModal.map((member) => (
                <div key={member._id} className="suggestion-item" style={{ marginBottom: '15px' }}>
                  <div className="suggestion-info">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt="Avatar"
                        className="suggestion-avatar"
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="suggestion-avatar" style={{ width: '32px', height: '32px' }}></div>
                    )}
                    <Link
                      to={`/profile/${member._id}`}
                      className="suggestion-username"
                      style={{ display: 'flex', alignItems: 'center' }}
                      onClick={() => setUserListModal(null)}
                    >
                      {member.username}
                      {member.isVerified && <span className="verified-badge">✓</span>}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;