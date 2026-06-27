import { useState, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { postService } from '../../services/postService';
import { uploadService } from '../../services/uploadService';
import Avatar from '../common/Avatar';
import { ImagePlus, X, Loader2 } from 'lucide-react';

const CreatePostForm = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
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
      setImage(res.data.imageUrl);
    } catch (error) {
      console.error(error);
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (uploading) return;
    try {
      await postService.createPost(caption, image);
      setCaption('');
      setImage('');
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onPostCreated();
    } catch (error) {
      console.error(error);
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
      <form onSubmit={handleCreatePost}>
        <div className="form-group">
          <textarea
            rows="3"
            placeholder="What's on your mind? Use #tags!"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            required
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
        <button type="submit" className="btn" disabled={uploading}>Post</button>
      </form>
    </div>
  );
};

export default CreatePostForm;