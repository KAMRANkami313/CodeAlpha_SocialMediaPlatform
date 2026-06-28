import { useState, useRef } from 'react';
import { userService } from '../../services/userService';
import { uploadService } from '../../services/uploadService';
import Avatar from '../common/Avatar';
import ImageCropperModal from '../common/ImageCropperModal';
import { Camera, Loader2, AlertCircle } from 'lucide-react';

const ProfileEditForm = ({ initialProfile, savedPosts, setUser, onCancel, onUpdated }) => {
  const [usernameInput, setUsernameInput] = useState(initialProfile.username);
  const [emailInput, setEmailInput] = useState(initialProfile.email);
  const [bioInput, setBioInput] = useState(initialProfile.bio);
  const [profilePicInput, setProfilePicInput] = useState(initialProfile.profilePicture);
  const [isVerifiedInput, setIsVerifiedInput] = useState(initialProfile.isVerified);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [cropperSrc, setCropperSrc] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropperSrc(url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCropComplete = async (croppedUrl, croppedBlob) => {
    setCropperSrc(null);
    setUploading(true);
    try {
      const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
      const res = await uploadService.uploadImage(file);
      setProfilePicInput(res.data.imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    setCropperSrc(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (uploading) return;
    setError('');
    try {
      const response = await userService.updateProfile({
        username: usernameInput,
        email: emailInput,
        bio: bioInput,
        profilePicture: profilePicInput,
        isVerified: isVerifiedInput
      });

      const updatedUser = {
        id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        bio: response.data.bio,
        profilePicture: response.data.profilePicture,
        isVerified: response.data.isVerified,
        savedPosts: savedPosts
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      onCancel();
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
    }
  };

  return (
    <form onSubmit={handleUpdateProfile}>
      {error && (
        <div className="profile-edit-error">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <div className="form-group profile-edit-avatar-row">
        <Avatar
          src={profilePicInput}
          alt="Profile Preview"
          className="post-avatar"
          style={{ width: '64px', height: '64px' }}
        />
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn profile-edit-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
            {uploading ? 'Uploading...' : 'Change Photo'}
          </button>
        </div>
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          placeholder="Email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <textarea
          placeholder="Bio"
          value={bioInput}
          onChange={(e) => setBioInput(e.target.value)}
        />
      </div>
      <div className="form-group profile-edit-verified">
        <input
          type="checkbox"
          checked={isVerifiedInput}
          onChange={(e) => setIsVerifiedInput(e.target.checked)}
          style={{ width: 'auto', accentColor: 'var(--accent)' }}
        />
        <label>Request Verification Checkmark Badge</label>
      </div>
      <div className="profile-edit-actions">
        <button type="submit" className="btn profile-edit-save" disabled={uploading}>Save Changes</button>
        <button type="button" className="btn profile-edit-cancel" onClick={onCancel}>Cancel</button>
      </div>

      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          aspect={1}
          title="Crop Profile Picture"
          onCropComplete={handleCropComplete}
          onClose={handleCropCancel}
        />
      )}
    </form>
  );
};

export default ProfileEditForm;