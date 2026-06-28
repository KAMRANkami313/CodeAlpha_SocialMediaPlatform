import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { notificationService } from '../../services/notificationService';
import { Bell, Heart, MessageCircle, UserPlus, Inbox, CheckCheck } from 'lucide-react';

const NotificationDropdown = ({
  notifications,
  fetchNotifications,
  markAsRead,
  markSingleAsRead,
  mobile = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const handleToggle = async (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some(n => !n.read)) {
      try {
        await markAsRead();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleNotificationClick = async (e, notification) => {
    e.stopPropagation();
    if (!notification.read) {
      try {
        await markSingleAsRead(notification._id);
      } catch (err) {
        console.error(err);
      }
    }

    if (notification.post) {
      navigate(`/?postId=${notification.post._id}`);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.sender._id}`);
    }

    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type) => {
    if (type === 'like') return <Heart size={14} className="notification-type-icon like" fill="currentColor" />;
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

  const formatTime = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const renderDropdown = () => (
    <div
      className={`notification-dropdown ${mobile ? 'notification-dropdown-mobile' : ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="notification-dropdown-header">
        <span>Notifications</span>
        {unreadCount > 0 && (
          <button
            className="notification-mark-all-btn"
            onClick={async (e) => {
              e.stopPropagation();
              await markAsRead();
            }}
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      <div className="notification-filter-tabs">
        <button
          className={`notification-filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setFilter('all'); }}
        >
          All
          {notifications.length > 0 && <span className="notification-filter-count">{notifications.length}</span>}
        </button>
        <button
          className={`notification-filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setFilter('unread'); }}
        >
          Unread
          {unreadCount > 0 && <span className="notification-filter-count unread">{unreadCount}</span>}
        </button>
      </div>

      <div className="notification-list">
        {filteredNotifications.map((n) => (
          <div
            key={n._id}
            className={`notification-item ${!n.read ? 'unread' : ''}`}
            onClick={(e) => handleNotificationClick(e, n)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleNotificationClick(e, n); }}
          >
            <Avatar
              src={n.sender?.profilePicture}
              alt="Avatar"
              className="notification-avatar"
            />
            <div className="notification-item-body">
              <strong style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                {n.sender?.username}
                <VerifiedBadge show={n.sender?.isVerified} />
              </strong>{' '}
              {getNotificationText(n.type)}
              <span className="notification-time">{formatTime(n.createdAt)}</span>
            </div>
            {getNotificationIcon(n.type)}
          </div>
        ))}
        {filteredNotifications.length === 0 && (
          <div className="notification-empty">
            <Inbox size={32} />
            <span>{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (mobile) {
    return (
      <div className="navbar-mobile-notification-wrapper">
        <button
          onClick={handleToggle}
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
        onClick={handleToggle}
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