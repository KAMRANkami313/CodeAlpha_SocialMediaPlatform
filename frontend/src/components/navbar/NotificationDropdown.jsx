import { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const NotificationDropdown = ({ notifications, fetchNotifications }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleToggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some(n => !n.read)) {
      try {
        await notificationService.markAsRead();
        fetchNotifications();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <button onClick={handleToggleNotifications} style={{ position: 'relative' }} aria-label="Notifications">
        Notifications
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      {showNotifications && (
        <div className="notification-dropdown">
          {notifications.map((n) => (
            <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
              <Avatar
                src={n.sender.profilePicture}
                alt="Avatar"
                className="notification-avatar"
              />
              <div>
                <strong style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                  {n.sender.username}
                  <VerifiedBadge show={n.sender.isVerified} />
                </strong>{' '}
                {n.type === 'like' && 'liked your post'}
                {n.type === 'comment' && 'commented on your post'}
                {n.type === 'follow' && 'started following you'}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div style={{ padding: 'var(--space-6) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--secondary-text)', textAlign: 'center' }}>
              No notifications yet
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationDropdown;