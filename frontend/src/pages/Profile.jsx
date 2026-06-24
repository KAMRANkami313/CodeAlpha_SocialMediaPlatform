import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bioInput, setBioInput] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      const resProfile = await API.get(`/users/profile/${id}`);
      setProfile(resProfile.data);
      setBioInput(resProfile.data.bio);
      const resPosts = await API.get(`/posts/user/${id}`);
      setPosts(resPosts.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
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

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      await API.put('/users/profile', { bio: bioInput });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div className="container">Loading profile...</div>;

  const isMe = user?.id === profile._id;
  const isFollowing = profile.followers.some(f => f._id === user?.id);

  return (
    <div className="container">
      <div className="profile-header">
        <div className="profile-avatar"></div>
        <div className="profile-info">
          <h2>
            {profile.username}
            {user && !isMe && (
              <button className="btn" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleFollowUnfollow}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </h2>
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
            <span><strong>{profile.followers.length}</strong> followers</span>
            <span><strong>{profile.following.length}</strong> following</span>
          </div>
          {editing ? (
            <form onSubmit={handleUpdateBio}>
              <div className="form-group">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn" style={{ width: 'auto', marginRight: '10px' }}>Save</button>
              <button type="button" className="btn" style={{ width: 'auto', backgroundColor: '#dbdbdb', color: '#000' }} onClick={() => setEditing(false)}>Cancel</button>
            </form>
          ) : (
            <div className="profile-bio">
              <p>{profile.bio || 'No bio yet.'}</p>
              {isMe && (
                <button className="btn" style={{ width: 'auto', padding: '5px 15px', backgroundColor: '#dbdbdb', color: '#000' }} onClick={() => setEditing(true)}>Edit Bio</button>
              )}
            </div>
          )}
        </div>
      </div>

      <h3>Posts</h3>
      {posts.map((post) => (
        <div className="post-card" key={post._id}>
          {post.image && <img src={post.image} alt="Post content" className="post-image" />}
          <div className="post-content">
            <p>{post.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Profile;