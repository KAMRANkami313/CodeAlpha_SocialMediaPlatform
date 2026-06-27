import { BadgeCheck } from 'lucide-react';

const VerifiedBadge = ({ show = true, size = 'default' }) => {
  if (!show) return null;

  const iconSize = size === 'small' ? 11 : 14;
  const marginLeft = size === 'small' ? '2px' : '4px';

  return (
    <BadgeCheck
      size={iconSize}
      className="verified-badge"
      style={{
        marginLeft,
        color: 'var(--accent)',
        fill: 'var(--accent-light)',
        flexShrink: 0
      }}
      aria-label="Verified"
    />
  );
};

export default VerifiedBadge;