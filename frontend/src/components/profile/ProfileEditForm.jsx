import { useState, useRef } from 'react';
import { userService } from '../../services/userService';
import { uploadService } from '../../services/uploadService';
import Avatar from '../common/Avatar';

const ProfileEditForm = ({ initialProfile, savedPosts, setUser, onCancel, onUpdated }) => {
  const [usernameInput, setUsernameInput] = useState(initialProfile.username);
  const [emailInput, setEmailInput] = useState(initialProfile.email);
  const [bioInput, setBioInput] = useState(initialProfile.bio);
  const [profilePicInput, setProfilePicInput] = useState(initialProfile.profilePicture);
  const [isVerifiedInput, setIsVerifiedInput] = useState(initialProfile.isVerified);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImage(file);
      setProfilePicInput(res.data.imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
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
        <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-4) 0', padding: 'var(--space-2) var(--space-3)', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </p>
      )}
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
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
            className="btn"
            style={{ width: 'auto', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', background: 'var(--bg-subtle)', color: 'var(--text-color)' }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
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
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <input
          type="checkbox"
          checked={isVerifiedInput}
          onChange={(e) => setIsVerifiedInput(e.target.checked)}
          style={{ width: 'auto', accentColor: 'var(--accent)' }}
        />
        <label style={{ fontSize: 'var(--text-sm)' }}>Request Verification Checkmark Badge</label>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button type="submit" className="btn" style={{ width: 'auto' }} disabled={uploading}>Save Changes</button>
        <button type="button" className="btn" style={{ width: 'auto', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ProfileEditForm;