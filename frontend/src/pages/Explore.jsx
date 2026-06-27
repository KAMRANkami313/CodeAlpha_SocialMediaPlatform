import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { exploreService } from '../services/exploreService';
import Avatar from '../components/common/Avatar';
import VerifiedBadge from '../components/common/VerifiedBadge';
import EmptyState from '../components/common/EmptyState';
import { ExploreSkeleton } from '../components/common/Skeleton';
import { Users, TrendingUp, Heart, Hash, UserCircle2, ArrowRight } from 'lucide-react';

const Explore = () => {
  const [exploreData, setExploreData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await exploreService.getExploreData();
        setExploreData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExplore();
  }, []);

  if (!exploreData) {
    return (
      <div className="container" style={{ maxWidth: '1024px' }}>
        <ExploreSkeleton />
      </div>
    );
  }

  const { trendingPosts, discoverUsers, trendingTags } = exploreData;

  return (
    <div className="container" style={{ maxWidth: '1024px' }}>
      <div className="explore-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
        <div>
          <h3 className="explore-section-title">
            <Users size={18} />
            Discover People
          </h3>
          {discoverUsers.length === 0 ? (
            <EmptyState
              icon={<UserCircle2 size={48} />}
              title="No people to discover"
              message="Check back later for new users to connect with."
            />
          ) : (
            <div className="explore-grid">
              {discoverUsers.map((u) => (
                <div key={u._id} className="explore-user-card">
                  <Avatar
                    src={u.profilePicture}
                    alt="Avatar"
                    className="explore-user-avatar"
                  />
                  <Link to={`/profile/${u._id}`} className="explore-user-name">
                    {u.username}
                    <VerifiedBadge show={u.isVerified} />
                  </Link>
                  <p className="explore-user-bio">{u.bio || 'No bio yet'}</p>
                  <button className="btn explore-view-btn" onClick={() => navigate(`/profile/${u._id}`)}>
                    View Profile
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="explore-section-title">
            <Hash size={18} />
            Trending Tags
          </h3>
          <div className="auth-card" style={{ padding: 'var(--space-5)', textAlign: 'left' }}>
            {trendingTags.map((item) => (
              <div
                key={item.tag}
                className="explore-tag-item"
                onClick={() => navigate(`/?tag=${item.tag}`)}
              >
                <span className="hashtag" style={{ fontWeight: 600 }}>#{item.tag}</span>
                <div className="explore-tag-count">{item.count} posts</div>
              </div>
            ))}
            {trendingTags.length === 0 && (
              <div className="explore-tags-empty">
                <Hash size={24} />
                <span>No trending tags yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="explore-section-title">
        <TrendingUp size={18} />
        Trending Posts
      </h3>
      {trendingPosts.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={48} />}
          title="No trending posts yet"
          message="Start posting and liking to see trending content here."
        />
      ) : (
        <div className="explore-grid">
          {trendingPosts.map((post) => (
            <div key={post._id} className="post-card" style={{ margin: 0, overflow: 'hidden' }}>
              <div className="post-header">
                <Avatar
                  src={post.user.profilePicture}
                  alt="Avatar"
                  className="post-avatar"
                  style={{ width: '32px', height: '32px' }}
                />
                <Link to={`/profile/${post.user._id}`} className="post-header-link" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  {post.user.username}
                  <VerifiedBadge show={post.user.isVerified} />
                </Link>
              </div>
              {post.image ? (
                <img src={post.image} alt="Trending content" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ padding: 'var(--space-5)', height: '140px', overflow: 'hidden', fontSize: 'var(--text-sm)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-color)' }}>
                  {post.caption}
                </div>
              )}
              <div className="explore-post-likes">
                <Heart size={13} fill="currentColor" className="explore-post-like-icon" />
                {post.likes.length} likes
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;