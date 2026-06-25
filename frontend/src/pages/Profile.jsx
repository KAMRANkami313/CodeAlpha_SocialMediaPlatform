import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { userService } from '../services/userService';
import { postService } from '../services/postService';
import Avatar from '../components/common/Avatar';
import VerifiedBadge from '../components/common/VerifiedBadge';
import LikersModal from '../components/common/LikersModal';
import UserListModal from '../components/common/UserListModal';
import ProfileHeader from '../components/profile/ProfileHeader';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const [activeLikers, setActiveLikers] = useState(null);
  const [userListModal, setUserListModal] = useState(null);
  const [userListTitle, setUserListTitle] = useState('');

  const fetchProfile = async () => {
    try {
      const resProfile = await userService.getProfile(id);
      setProfile(resProfile.data);
      const resPosts = await postService.getUserPosts(id);
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
      />

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
            <Avatar
              src={post.user.profilePicture}
              alt="Avatar"
              className="post-avatar"
            />
            <strong style={{ display: 'flex', alignItems: 'center' }}>
              {post.user.username}
              <VerifiedBadge show={post.user.isVerified} />
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
        <LikersModal likers={activeLikers} onClose={() => setActiveLikers(null)} />
      )}

      {userListModal && (
        <UserListModal
          title={userListTitle}
          users={userListModal}
          onClose={() => setUserListModal(null)}
        />
      )}
    </div>
  );
};

export default Profile;