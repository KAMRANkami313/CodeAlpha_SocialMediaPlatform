import { useState } from 'react';

const Avatar = ({ src, alt = 'Avatar', className = '', style = {} }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (src && !error) {
    return (
      <>
        {!loaded && <div className={`${className} avatar-skeleton`} style={style} aria-hidden="true" />}
        <img
          src={src}
          alt={alt}
          className={className}
          style={{
            ...style,
            objectFit: 'cover',
            display: loaded ? 'block' : 'none'
          }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </>
    );
  }
  return <div className={className} style={style} />;
};

export default Avatar;