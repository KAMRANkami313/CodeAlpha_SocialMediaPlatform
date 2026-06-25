const VerifiedBadge = ({ show = true, size = 'default' }) => {
  if (!show) return null;

  const sizeStyle =
    size === 'small'
      ? { width: '9px', height: '9px', fontSize: '6px' }
      : {};

  return (
    <span className="verified-badge" style={sizeStyle}>
      ✓
    </span>
  );
};

export default VerifiedBadge;