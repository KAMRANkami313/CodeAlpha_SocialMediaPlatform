import { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { Bell, Heart, MessageCircle, UserPlus, Inbox } from 'lucide-react';

const NotificationDropdown = ({ notifications, fetchNotifications, mobile = false }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleToggleNotifications = async (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
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

  const getNotificationIcon = (type) => {
    if (type === 'like') return <Heart size={14} className="notification-type-icon like" />;
    if (type === 'comment') return <MessageCircle size={14} className="notification-type-icon comment" />;
    if (type === 'follow') return <UserPlus size={14} className="notification-type-icon follow" />;
    return null;
  };

  const getNotificationText = (type) => {
    if (type === 'like') return 'liked your post';
    if (type === 'comment') return 'commented on your post';
    if (type === 'follow') return 'started following you';
    return '';
  };

  const renderDropdown = () => (
    <div
      className={`notification-dropdown ${mobile ? 'notification-dropdown-mobile' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="notification-dropdown-header">
        <span>Notifications</span>
        {unreadCount > 0 && <span className="notification-dropdown-count">{unreadCount} new</span>}
      </div>
      {notifications.map((n) => (
        <div key={n._id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
          <Avatar
            src={n.sender.profilePicture}
            alt="Avatar"
            className="notification-avatar"
          />
          <div className="notification-item-body">
            <strong style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
              {n.sender.username}
              <VerifiedBadge show={n.sender.isVerified} />
            </strong>{' '}
            {getNotificationText(n.type)}
          </div>
          {getNotificationIcon(n.type)}
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="notification-empty">
          <Inbox size={32} />
          <span>No notifications yet</span>
        </div>
      )}
    </div>
  );

  if (mobile) {
    return (
      <div className="navbar-mobile-notification-wrapper">
        <button
          onClick={handleToggleNotifications}
          className="navbar-mobile-link"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          aria-expanded={showNotifications}
        >
          <Bell size={18} />
          <span>Notifications</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          <span className="navbar-mobile-chevron">
            {showNotifications ? '▲' : '▼'}
          </span>
        </button>
        {showNotifications && renderDropdown()}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleToggleNotifications}
        className="navbar-icon-btn"
        style={{ position: 'relative' }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>
      {showNotifications && renderDropdown()}
    </>
  );
};

export default NotificationDropdown;