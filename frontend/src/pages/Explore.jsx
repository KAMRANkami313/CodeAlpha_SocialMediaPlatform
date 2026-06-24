import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Explore = () => {
  const [exploreData, setExploreData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await API.get('/explore');
        setExploreData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExplore();
  }, []);

  if (!exploreData) return <div className="container">Loading explore page...</div>;

  const { trendingPosts, discoverUsers, trendingTags } = exploreData;

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '30px', marginBottom: '40px' }}>
        <div>
          <h3>Discover People</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {discoverUsers.map((u) => (
              <div key={u._id} className="auth-card" style={{ padding: '20px', textAlign: 'center' }}>
                {u.profilePicture ? (
                  <img src={u.profilePicture} alt="Avatar" className="profile-avatar" style={{ width: '80px', height: '80px', margin: '0 auto 10px auto', objectFit: 'cover' }} />
                ) : (
                  <div className="profile-avatar" style={{ width: '80px', height: '80px', margin: '0 auto 10px auto' }}></div>
                )}
                <Link
                  to={`/profile/${u._id}`}
                  style={{ fontWeight: 'bold', textDecoration: 'none', color: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px' }}
                >
                  {u.username}
                  {u.isVerified && <span className="verified-badge">✓</span>}
                </Link>
                <p style={{ fontSize: '12px', color: '#8e8e8e', margin: '0 0 10px 0', height: '36px', overflow: 'hidden' }}>{u.bio || 'No bio yet'}</p>
                <button className="btn" style={{ padding: '5px 15px', fontSize: '13px' }} onClick={() => navigate(`/profile/${u._id}`)}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3>Trending Tags</h3>
          <div className="auth-card" style={{ padding: '20px', textAlign: 'left' }}>
            {trendingTags.map((item) => (
              <div
                key={item.tag}
                style={{ padding: '10px 0', borderBottom: '1px solid #efefef', cursor: 'pointer' }}
                onClick={() => navigate(`/?tag=${item.tag}`)}
              >
                <span className="hashtag" style={{ fontWeight: 'bold' }}>#{item.tag}</span>
                <div style={{ fontSize: '11px', color: '#8e8e8e', marginTop: '3px' }}>{item.count} posts</div>
              </div>
            ))}
            {trendingTags.length === 0 && (
              <div style={{ fontSize: '13px', color: '#8e8e8e', textAlign: 'center' }}>No trending tags yet</div>
            )}
          </div>
        </div>
      </div>

      <h3>Trending Posts</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {trendingPosts.map((post) => (
          <div key={post._id} className="post-card" style={{ margin: 0, overflow: 'hidden' }}>
            <div className="post-header">
              {post.user.profilePicture ? (
                <img src={post.user.profilePicture} alt="Avatar" className="post-avatar" style={{ width: '24px', height: '24px', objectFit: 'cover' }} />
              ) : (
                <div className="post-avatar" style={{ width: '24px', height: '24px' }}></div>
              )}
              <Link to={`/profile/${post.user._id}`} style={{ fontSize: '13px', textDecoration: 'none', color: '#262626', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                {post.user.username}
                {post.user.isVerified && <span className="verified-badge">✓</span>}
              </Link>
            </div>
            {post.image ? (
              <img src={post.image} alt="Trending content" style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ padding: '20px', height: '140px', overflow: 'hidden', fontSize: '14px', borderTop: '1px solid #efefef', borderBottom: '1px solid #efefef' }}>
                {post.caption}
              </div>
            )}
            <div style={{ padding: '10px 15px', fontSize: '13px', borderTop: '1px solid #efefef' }}>
              ❤️ {post.likes.length} likes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;