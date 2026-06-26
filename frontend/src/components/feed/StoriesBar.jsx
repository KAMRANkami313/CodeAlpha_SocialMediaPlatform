import { useState, useRef } from 'react';
import { storyService } from '../../services/storyService';
import { uploadService } from '../../services/uploadService';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import Modal from '../common/Modal';

const StoriesBar = ({ user, stories, onStoryCreated, onStoryClick }) => {
  const [storyCreateModal, setStoryCreateModal] = useState(false);
  const [storyImg, setStoryImg] = useState('');
  const [storyText, setStoryText] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setImagePreview(URL.createObjectURL(file));
    try {
      const res = await uploadService.uploadImage(file);
      setStoryImg(res.data.imageUrl);
    } catch (error) {
      console.error(error);
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (uploading) return;
    try {
      await storyService.createStory(storyImg, storyText);
      setStoryImg('');
      setStoryText('');
      setImagePreview('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStoryCreateModal(false);
      onStoryCreated();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setStoryCreateModal(false);
    setStoryImg('');
    setStoryText('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        <Modal title="Add Story" onClose={handleCloseModal}>
          <form onSubmit={handleCreateStory}>
            {imagePreview && (
              <div className="image-preview-container" style={{ marginBottom: 'var(--space-4)' }}>
                <img src={imagePreview} alt="Preview" className="image-preview" style={{ maxHeight: '200px' }} />
                {uploading && <div className="image-preview-uploading">Uploading...</div>}
              </div>
            )}
            <div className="form-group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn"
                style={{ width: 'auto', background: 'var(--bg-subtle)', color: 'var(--text-color)', marginBottom: 'var(--space-3)' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : '📷 Upload Story Image'}
              </button>
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="Story Text (Optional)"
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
              />
            </div>
            <button type="submit" className="btn" disabled={uploading || !storyImg}>Share to Story</button>
          </form>
        </Modal>
      )}
    </>
  );
};

export default StoriesBar;