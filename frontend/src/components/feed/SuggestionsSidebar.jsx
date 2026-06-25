import { Link } from 'react-router-dom';
import { ACTIVITY_THRESHOLD_MS } from '../../utils/constants';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const evaluateActivityStatus = (lastActivityDate) => {
  if (!lastActivityDate) return false;
  const difference = Date.now() - new Date(lastActivityDate).getTime();
  return difference < ACTIVITY_THRESHOLD_MS;
};

const SuggestionsSidebar = ({ suggestions, onFollow }) => {
  return (
    <div className="sidebar-widget">
      <div className="sidebar-title">Suggestions for you</div>
      {suggestions.map((suggestion) => (
        <div className="suggestion-item" key={suggestion._id}>
          <div className="suggestion-info">
            <div className="suggestion-avatar-wrapper">
              <Avatar
                src={suggestion.profilePicture}
                alt="Avatar"
                className="suggestion-avatar"
              />
              {evaluateActivityStatus(suggestion.lastActivityTimestamp) && (
                <span className="activity-indicator-dot"></span>
              )}
            </div>
            <Link to={`/profile/${suggestion._id}`} className="suggestion-username">
              {suggestion.username}
              <VerifiedBadge show={suggestion.isVerified} />
            </Link>
          </div>
          <button className="follow-link" onClick={() => onFollow(suggestion._id)}>
            Follow
          </button>
        </div>
      ))}
      {suggestions.length === 0 && (
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--secondary-text)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
          No new suggestions
        </div>
      )}
    </div>
  );
};

export default SuggestionsSidebar;