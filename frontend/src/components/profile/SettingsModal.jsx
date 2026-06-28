import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import { authService } from '../../services/authService';
import { KeyRound, Trash2, AlertTriangle, CheckCircle2, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';

const SettingsModal = ({ onClose, onAccountDeleted }) => {
  const [activeSection, setActiveSection] = useState('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTwoFactor = async () => {
      try {
        const res = await authService.getTwoFactorStatus();
        setTwoFactorEnabled(res.data.twoFactorEnabled);
      } catch (err) {
        console.error(err);
      } finally {
        setTwoFactorLoading(false);
      }
    };
    checkTwoFactor();
  }, []);

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

  const handleTwoFactorClick = () => {
    onClose();
    navigate('/setup-2fa');
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          <KeyRound size={14} />
          Change Password
        </button>
        <button
          className={`settings-tab ${activeSection === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSection('security')}
        >
          <ShieldCheck size={14} />
          Security
        </button>
        <button
          className={`settings-tab ${activeSection === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveSection('delete')}
        >
          <Trash2 size={14} />
          Delete Account
        </button>
      </div>

      {activeSection === 'password' && (
        <form onSubmit={handleChangePassword} className="settings-form">
          {passwordError && <p className="auth-error">{passwordError}</p>}
          {passwordMessage && (
            <p className="settings-success">
              <CheckCircle2 size={14} />
              {passwordMessage}
            </p>
          )}
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

      {activeSection === 'security' && (
        <div className="settings-security-section">
          <div className={`two-factor-status-card ${twoFactorEnabled ? 'enabled' : 'disabled'}`}>
            <div className="two-factor-status-icon">
              {twoFactorLoading ? (
                <Loader2 size={24} className="spin" />
              ) : twoFactorEnabled ? (
                <ShieldCheck size={24} />
              ) : (
                <ShieldAlert size={24} />
              )}
            </div>
            <div className="two-factor-status-body">
              <strong>Two-Factor Authentication</strong>
              <span>
                {twoFactorLoading
                  ? 'Checking status…'
                  : twoFactorEnabled
                    ? 'Enabled — your account is protected with an extra layer of security.'
                    : 'Not enabled — add an extra layer of security to your account.'
                }
              </span>
            </div>
          </div>
          <button
            className="btn auth-submit-btn"
            onClick={handleTwoFactorClick}
            disabled={twoFactorLoading}
          >
            {twoFactorEnabled ? <><ShieldCheck size={16} /> Manage 2FA</> : <><ShieldAlert size={16} /> Enable 2FA</>}
          </button>
          <p className="settings-security-help">
            2FA requires a verification code from an authenticator app (Google Authenticator, Authy, 1Password) each time you log in. Backup codes are provided for emergency access.
          </p>
        </div>
      )}

      {activeSection === 'delete' && (
        <div className="settings-danger-zone">
          <div className="settings-danger-intro">
            <AlertTriangle size={32} className="settings-danger-icon" />
            <p className="settings-danger-text">
              Permanently delete your account and all associated data including posts, comments, messages, and stories. This action cannot be undone.
            </p>
          </div>
          {deleteError && <p className="auth-error">{deleteError}</p>}
          {!deleteConfirm ? (
            <button
              className="btn settings-danger-btn"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 size={14} />
              Delete My Account
            </button>
          ) : (
            <div className="settings-confirm-delete">
              <p className="settings-confirm-text">
                <ShieldCheck size={14} />
                Are you absolutely sure? This cannot be undone.
              </p>
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