import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import { authService } from '../../services/authService';
import { KeyRound, Trash2, AlertTriangle, CheckCircle2, ShieldCheck, ShieldAlert, Loader2, Smartphone, Monitor, X, Clock, Globe, Shield } from 'lucide-react';

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
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTrustedDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const res = await authService.getTrustedDevices();
      setTrustedDevices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const res = await authService.getActivityLog();
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkTwoFactor = async () => {
      try {
        const res = await authService.getTwoFactorStatus();
        setTwoFactorEnabled(res.data.twoFactorEnabled);
        if (res.data.twoFactorEnabled) {
          fetchTrustedDevices();
        }
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

  const handleRevokeDevice = async (deviceId) => {
    try {
      await authService.revokeTrustedDevice(deviceId);
      setTrustedDevices(prev => prev.filter(d => d._id !== deviceId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm('Revoke all trusted devices? You\'ll need 2FA on every device next time you log in.')) return;
    try {
      await authService.revokeAllTrustedDevices();
      setTrustedDevices([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getDeviceIcon = (deviceName) => {
    if (!deviceName) return <Monitor size={16} />;
    if (deviceName.includes('Android') || deviceName.includes('iOS')) return <Smartphone size={16} />;
    return <Monitor size={16} />;
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getLoginMethodLabel = (method) => {
    if (method === 'password') return 'Password';
    if (method === 'two_factor') return '2FA Code';
    if (method === 'trusted_device') return 'Trusted Device';
    if (method === 'register') return 'Registration';
    return method;
  };

  const getLoginMethodIcon = (method) => {
    if (method === 'password') return <KeyRound size={12} />;
    if (method === 'two_factor') return <Shield size={12} />;
    if (method === 'trusted_device') return <ShieldCheck size={12} />;
    if (method === 'register') return <Monitor size={12} />;
    return <Clock size={12} />;
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
          onClick={() => {
            setActiveSection('security');
            if (activities.length === 0 && !activitiesLoading) {
              fetchActivities();
            }
          }}
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

          {twoFactorEnabled && (
            <div className="trusted-devices-section">
              <div className="trusted-devices-header">
                <strong>Trusted Devices</strong>
                {trustedDevices.length > 0 && (
                  <button className="revoke-all-btn" onClick={handleRevokeAll}>
                    Revoke All
                  </button>
                )}
              </div>
              <p className="trusted-devices-help">
                Devices where you checked "Remember this device". They skip 2FA for 30 days.
              </p>
              {devicesLoading ? (
                <div className="trusted-devices-loading">
                  <Loader2 size={16} className="spin" />
                  <span>Loading devices…</span>
                </div>
              ) : trustedDevices.length === 0 ? (
                <div className="trusted-devices-empty">
                  <Monitor size={20} />
                  <span>No trusted devices yet</span>
                </div>
              ) : (
                <div className="trusted-devices-list">
                  {trustedDevices.map((device) => (
                    <div key={device._id} className="trusted-device-item">
                      <div className="trusted-device-icon">
                        {getDeviceIcon(device.deviceName)}
                      </div>
                      <div className="trusted-device-info">
                        <span className="trusted-device-name">{device.deviceName || 'Unknown Device'}</span>
                        <span className="trusted-device-date">
                          {device.lastUsedAt
                            ? `Last used ${new Date(device.lastUsedAt).toLocaleDateString()}`
                            : `Added ${new Date(device.createdAt).toLocaleDateString()}`
                          }
                        </span>
                      </div>
                      <button
                        className="trusted-device-revoke"
                        onClick={() => handleRevokeDevice(device._id)}
                        aria-label="Revoke device"
                        title="Revoke"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="activity-log-section">
            <div className="activity-log-header">
              <strong>Recent Activity</strong>
              <button className="refresh-activity-btn" onClick={fetchActivities} disabled={activitiesLoading}>
                {activitiesLoading ? <Loader2 size={13} className="spin" /> : 'Refresh'}
              </button>
            </div>
            <p className="activity-log-help">
              Recent logins to your account. If you see activity you don't recognize, change your password immediately.
            </p>
            {activitiesLoading ? (
              <div className="activity-log-loading">
                <Loader2 size={16} className="spin" />
                <span>Loading activity…</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="activity-log-empty">
                <Clock size={20} />
                <span>No recent activity</span>
              </div>
            ) : (
              <div className="activity-log-list">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity._id} className="activity-log-item">
                    <div className="activity-log-icon">
                      {getDeviceIcon(activity.deviceName)}
                    </div>
                    <div className="activity-log-info">
                      <div className="activity-log-top">
                        <span className="activity-log-device">{activity.deviceName || 'Unknown Device'}</span>
                        <span className="activity-log-time">{formatActivityTime(activity.timestamp)}</span>
                      </div>
                      <div className="activity-log-meta">
                        <span className={`activity-log-method ${activity.loginMethod}`}>
                          {getLoginMethodIcon(activity.loginMethod)}
                          {getLoginMethodLabel(activity.loginMethod)}
                        </span>
                        {activity.ip && (
                          <span className="activity-log-ip">
                            <Globe size={11} />
                            {activity.ip}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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