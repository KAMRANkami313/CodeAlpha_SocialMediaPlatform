import { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { uploadService } from '../../services/uploadService';
import Avatar from '../common/Avatar';
import ImageCropperModal from '../common/ImageCropperModal';
import { ImagePlus, X, Loader2, Send, FileText, Calendar, Clock } from 'lucide-react';

const CreatePostForm = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [cropperSrc, setCropperSrc] = useState(null);
  const fileInputRef = useRef(null);

  const showStatus = (message, type = 'success') => {
    setStatusMessage(message);
    setStatusType(type);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropperSrc(url);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedUrl, croppedBlob) => {
    setCropperSrc(null);
    setUploading(true);
    setImagePreview(croppedUrl);
    try {
      const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
      const res = await uploadService.uploadImage(file);
      setImage(res.data.imageUrl);
    } catch (error) {
      console.error(error);
      setImagePreview('');
      showStatus('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropperSrc(null);
  };

  const handleRemoveImage = () => {
    setImage('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setCaption('');
    setImage('');
    setImagePreview('');
    setShowSchedule(false);
    setScheduledAt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!caption.trim() && !image) {
      showStatus('Please add a caption or image', 'error');
      return;
    }
    try {
      await postService.createPost(caption, image);
      resetForm();
      onPostCreated();
      showStatus('Post published!');
    } catch (error) {
      console.error(error);
      showStatus('Failed to publish post', 'error');
    }
  };

  const handleSaveDraft = async () => {
    if (uploading) return;
    if (!caption.trim() && !image) {
      showStatus('Please add a caption or image to save as draft', 'error');
      return;
    }
    try {
      await postService.createPost(caption, image, { isDraft: true });
      resetForm();
      showStatus('Draft saved!');
    } catch (error) {
      console.error(error);
      showStatus('Failed to save draft', 'error');
    }
  };

  const handleSchedulePost = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!caption.trim() && !image) {
      showStatus('Please add a caption or image', 'error');
      return;
    }
    if (!scheduledAt) {
      showStatus('Please select a date and time', 'error');
      return;
    }
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      showStatus('Scheduled time must be in the future', 'error');
      return;
    }
    try {
      await postService.createPost(caption, image, { scheduledAt: scheduledDate.toISOString() });
      resetForm();
      showStatus(`Post scheduled for ${scheduledDate.toLocaleString()}`);
    } catch (error) {
      console.error(error);
      showStatus('Failed to schedule post', 'error');
    }
  };

  return (
    <div className="auth-card" style={{ marginBottom: 'var(--space-6)', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Avatar
          src={user?.profilePicture}
          alt="Your Avatar"
          className="post-avatar"
          style={{ width: '40px', height: '40px' }}
        />
        <h3 style={{ margin: 0 }}>Create Post</h3>
      </div>

      {statusMessage && (
        <div className={`create-post-status ${statusType}`}>
          {statusType === 'success' ? <FileText size={14} /> : <X size={14} />}
          {statusMessage}
        </div>
      )}

      <form onSubmit={showSchedule ? handleSchedulePost : handleCreatePost}>
        <div className="form-group">
          <textarea
            rows="3"
            placeholder="What's on your mind? Use #tags!"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button type="button" className="image-preview-remove" onClick={handleRemoveImage} aria-label="Remove image">
              <X size={16} />
            </button>
            {uploading && (
              <div className="image-preview-uploading">
                <Loader2 size={20} className="spin" />
                <span>Uploading...</span>
              </div>
            )}
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
            className="btn upload-image-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>

        {showSchedule && (
          <div className="schedule-input-wrapper">
            <label className="schedule-label">
              <Calendar size={14} />
              Schedule for:
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="schedule-input"
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
            />
          </div>
        )}

        <div className="create-post-actions">
          <button type="submit" className="btn create-post-submit" disabled={uploading}>
            {showSchedule ? <><Clock size={16} /> Schedule Post</> : <><Send size={16} /> Post</>}
          </button>
          <button
            type="button"
            className="btn create-post-draft"
            onClick={handleSaveDraft}
            disabled={uploading}
          >
            <FileText size={16} />
            Save Draft
          </button>
          <button
            type="button"
            className={`btn create-post-schedule-toggle ${showSchedule ? 'active' : ''}`}
            onClick={() => setShowSchedule(!showSchedule)}
            disabled={uploading}
          >
            <Calendar size={16} />
            {showSchedule ? 'Cancel Schedule' : 'Schedule'}
          </button>
        </div>
      </form>

      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          aspect={4 / 3}
          title="Crop Post Image"
          onCropComplete={handleCropComplete}
          onClose={handleCropCancel}
        />
      )}
    </div>
  );
};

export default CreatePostForm;