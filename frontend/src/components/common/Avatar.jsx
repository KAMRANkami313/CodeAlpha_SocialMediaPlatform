const Avatar = ({ src, alt = 'Avatar', className = '', style = {} }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ ...style, objectFit: 'cover' }}
      />
    );
  }
  return <div className={className} style={style} />;
};

export default Avatar;