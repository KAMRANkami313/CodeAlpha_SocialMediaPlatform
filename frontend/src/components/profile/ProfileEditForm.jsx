import { useState } from 'react';
import { userService } from '../../services/userService';

const ProfileEditForm = ({ initialProfile, savedPosts, setUser, onCancel, onUpdated }) => {
  const [usernameInput, setUsernameInput] = useState(initialProfile.username);
  const [emailInput, setEmailInput] = useState(initialProfile.email);
  const [bioInput, setBioInput] = useState(initialProfile.bio);
  const [profilePicInput, setProfilePicInput] = useState(initialProfile.profilePicture);
  const [isVerifiedInput, setIsVerifiedInput] = useState(initialProfile.isVerified);
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
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
        <input
          type="text"
          placeholder="Profile Picture URL"
          value={profilePicInput}
          onChange={(e) => setProfilePicInput(e.target.value)}
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
        <button type="submit" className="btn" style={{ width: 'auto' }}>Save Changes</button>
        <button type="button" className="btn" style={{ width: 'auto', background: 'var(--bg-subtle)', color: 'var(--text-color)' }} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default ProfileEditForm;