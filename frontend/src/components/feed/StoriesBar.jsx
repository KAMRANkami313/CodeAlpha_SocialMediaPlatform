import { useState } from 'react';
import { storyService } from '../../services/storyService';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import Modal from '../common/Modal';

const StoriesBar = ({ user, stories, onStoryCreated, onStoryClick }) => {
  const [storyCreateModal, setStoryCreateModal] = useState(false);
  const [storyImg, setStoryImg] = useState('');
  const [storyText, setStoryText] = useState('');

  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      await storyService.createStory(storyImg, storyText);
      setStoryImg('');
      setStoryText('');
      setStoryCreateModal(false);
      onStoryCreated();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="stories-container">
        <div className="story-circle-wrapper create-story" onClick={() => setStoryCreateModal(true)}>
          <div style={{ position: 'relative' }}>
            <Avatar
              src={user.profilePicture}
              alt="My Avatar"
              className="story-circle"
            />
            <span className="story-add-badge">+</span>
          </div>
          <span className="story-username">Add Story</span>
        </div>

        {stories.map((group) => (
          <div key={group.user._id} className="story-circle-wrapper" onClick={() => onStoryClick(group)}>
            <Avatar
              src={group.user.profilePicture}
              alt="Avatar"
              className="story-circle"
            />
            <span className="story-username" style={{ display: 'flex', alignItems: 'center' }}>
              {group.user.username}
              <VerifiedBadge show={group.user.isVerified} size="small" />
            </span>
          </div>
        ))}
      </div>

      {storyCreateModal && (
        <Modal title="Add Story" onClose={() => setStoryCreateModal(false)}>
          <form onSubmit={handleCreateStory}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Story Image URL"
                value={storyImg}
                onChange={(e) => setStoryImg(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Story Text (Optional)"
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
              />
            </div>
            <button type="submit" className="btn">Share to Story</button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default StoriesBar;