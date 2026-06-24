import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bioInput, setBioInput] = useState('');
  const [profilePicInput, setProfilePicInput] = useState('');
  const [isVerifiedInput, setIsVerifiedInput] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const [activeLikers, setActiveLikers] = useState(null);

  const fetchProfile = async () => {
    try {
      const resProfile = await API.get(`/users/profile/${id}`);
      setProfile(resProfile.data);
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
    try {
      await API.put('/users/profile', {
        bio: bioInput,
        profilePicture: profilePicInput,
        isVerified: isVerifiedInput
      });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageUser = () => {
    navigate('/messages', { state: { startChatWith: profile } });
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
            <span><strong>{profile.followers.length}</strong> followers</span>
            <span><strong>{profile.following.length}</strong> following</span>
          </div>
          {editing ? (
            <form onSubmit={handleUpdateProfile}>
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
    </div>
  );
};

export default Profile;