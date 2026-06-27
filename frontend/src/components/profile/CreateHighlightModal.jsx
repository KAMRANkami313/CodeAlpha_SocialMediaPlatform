import { useState, useRef } from 'react';
import Modal from '../common/Modal';
import { storyService } from '../../services/storyService';
import { uploadService } from '../../services/uploadService';

const CreateHighlightModal = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    setPreview(URL.createObjectURL(file));
    try {
      const res = await uploadService.uploadImage(file);
      setImage(res.data.imageUrl);
    } catch (err) {
      console.error(err);
      setError('Image upload failed. Please try again.');
      setPreview('');
      setImage('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading || submitting) return;
    if (!image) {
      setError('Please upload an image for your highlight.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await storyService.createHighlight(title.trim() || 'Untitled', image, []);
      onCreated();
    } catch (err) {
      console.error(err);
      setError('Could not create highlight. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (uploading || submitting) return;
    setTitle('');
    setImage('');
    setPreview('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <Modal title="New Story Highlight" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="highlight-form">
        {preview && (
          <div className="highlight-preview-wrapper">
            <img src={preview} alt="Highlight preview" className="highlight-preview-img" />
            {uploading && <div className="highlight-preview-uploading">Uploading…</div>}
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
            className="btn highlight-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || submitting}
          >
            {uploading ? 'Uploading…' : (preview ? 'Change Image' : '📷 Upload Image')}
          </button>
        </div>

        <div className="form-group">
          <label className="highlight-label">Highlight Title</label>
          <input
            type="text"
            placeholder="e.g. Travel, Food, Memories…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={30}
            className="highlight-title-input"
          />
          <span className="highlight-char-count">{title.length}/30</span>
        </div>

        {error && <div className="highlight-error">{error}</div>}

        <div className="highlight-actions">
          <button
            type="button"
            className="btn highlight-cancel-btn"
            onClick={handleClose}
            disabled={uploading || submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            disabled={uploading || submitting || !image}
          >
            {submitting ? 'Saving…' : 'Save Highlight'}
          </button>
        </div>

        <p className="highlight-help">
          Highlights stay on your profile permanently. Use them to save your favorite moments beyond the 24-hour story window.
        </p>
      </form>
    </Modal>
  );
};

export default CreateHighlightModal;