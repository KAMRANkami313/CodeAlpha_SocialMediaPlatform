import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon-wrapper">
          <Compass size={64} className="not-found-icon" />
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn not-found-btn">
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;