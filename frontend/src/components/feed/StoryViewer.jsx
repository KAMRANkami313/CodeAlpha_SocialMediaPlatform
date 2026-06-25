import { useState, useEffect, useRef } from 'react';
import { STORY_PROGRESS } from '../../utils/constants';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const StoryViewer = ({ activeStoryGroup, onClose }) => {
  const [storyProgress, setStoryProgress] = useState(0);
  const progressInterval = useRef(null);

  useEffect(() => {
    if (activeStoryGroup) {
      setStoryProgress(0);
      progressInterval.current = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            onClose();
            return 100;
          }
          return prev + STORY_PROGRESS.INCREMENT;
        });
      }, STORY_PROGRESS.INTERVAL_MS);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [activeStoryGroup, onClose]);

  if (!activeStoryGroup) return null;

  return (
    <div className="story-modal-overlay" onClick={onClose}>
      <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="story-progress-bar-bg">
          <div className="story-progress-bar-fg" style={{ width: `${storyProgress}%` }}></div>
        </div>
        <button className="story-close-btn" onClick={onClose} aria-label="Close story">
          ×
        </button>
        <div className="story-header-info">
          <Avatar
            src={activeStoryGroup.user.profilePicture}
            alt="Avatar"
            className="story-header-avatar"
          />
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {activeStoryGroup.user.username}
            <VerifiedBadge show={activeStoryGroup.user.isVerified} size="small" />
          </span>
        </div>
        <img
          src={activeStoryGroup.stories[0].image}
          alt="Story"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {activeStoryGroup.stories[0].text && (
          <div className="story-text-overlay">
            {activeStoryGroup.stories[0].text}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;