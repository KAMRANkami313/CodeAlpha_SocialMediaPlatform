const SkeletonBox = ({ width = '100%', height = '20px', radius = 'var(--radius-sm)' }) => (
  <div className="skeleton-box" style={{ width, height, borderRadius: radius }} />
);

export const PostSkeleton = () => (
  <div className="post-card">
    <div className="post-header">
      <SkeletonBox width="40px" height="40px" radius="50%" />
      <SkeletonBox width="120px" height="16px" />
    </div>
    <SkeletonBox width="100%" height="300px" radius="0" />
    <div className="post-actions">
      <SkeletonBox width="80px" height="16px" />
      <SkeletonBox width="60px" height="16px" />
    </div>
    <div className="post-content">
      <SkeletonBox width="90%" height="14px" />
      <SkeletonBox width="70%" height="14px" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="profile-header">
    <SkeletonBox width="150px" height="150px" radius="50%" />
    <div className="profile-info" style={{ flex: 1 }}>
      <SkeletonBox width="200px" height="28px" />
      <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
        <SkeletonBox width="80px" height="16px" />
        <SkeletonBox width="80px" height="16px" />
        <SkeletonBox width="80px" height="16px" />
      </div>
      <SkeletonBox width="300px" height="14px" />
    </div>
  </div>
);

export const ExploreSkeleton = () => (
  <div>
    <SkeletonBox width="180px" height="24px" />
    <div className="explore-grid" style={{ marginTop: 'var(--space-5)' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="explore-user-card">
          <SkeletonBox width="80px" height="80px" radius="50%" />
          <SkeletonBox width="120px" height="16px" />
          <SkeletonBox width="100px" height="12px" />
          <SkeletonBox width="100px" height="32px" radius="var(--radius-md)" />
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonBox;