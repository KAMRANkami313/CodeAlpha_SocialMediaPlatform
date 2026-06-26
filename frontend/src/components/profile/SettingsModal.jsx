import { useState } from 'react';
import Modal from '../common/Modal';
import { authService } from '../../services/authService';

const SettingsModal = ({ onClose, onAccountDeleted }) => {
  const [activeSection, setActiveSection] = useState('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await authService.deleteAccount();
      onAccountDeleted();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          Change Password
        </button>
        <button
          className={`settings-tab ${activeSection === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveSection('delete')}
        >
          Delete Account
        </button>
      </div>

      {activeSection === 'password' && (
        <form onSubmit={handleChangePassword} className="settings-form">
          {passwordError && <p className="auth-error">{passwordError}</p>}
          {passwordMessage && <p className="settings-success">{passwordMessage}</p>}
          <div className="form-group">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Update Password</button>
        </form>
      )}

      {activeSection === 'delete' && (
        <div className="settings-danger-zone">
          <p className="settings-danger-text">
            Permanently delete your account and all associated data including posts, comments, messages, and stories. This action cannot be undone.
          </p>
          {deleteError && <p className="auth-error">{deleteError}</p>}
          {!deleteConfirm ? (
            <button
              className="btn settings-danger-btn"
              onClick={() => setDeleteConfirm(true)}
            >
              Delete My Account
            </button>
          ) : (
            <div className="settings-confirm-delete">
              <p className="settings-confirm-text">Are you absolutely sure? This cannot be undone.</p>
              <div className="settings-confirm-buttons">
                <button className="btn settings-danger-btn" onClick={handleDeleteAccount}>
                  Yes, delete everything
                </button>
                <button
                  className="btn"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-color)' }}
                  onClick={() => setDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default SettingsModal;