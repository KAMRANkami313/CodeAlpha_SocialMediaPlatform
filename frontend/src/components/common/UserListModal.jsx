import { Link } from 'react-router-dom';
import Modal from './Modal';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';
import { Heart, Users, UserCheck, Inbox } from 'lucide-react';

const UserListModal = ({ title, users = [], onClose, emptyMessage = null, icon = null }) => {
  const renderIcon = () => {
    if (icon === 'heart') return <Heart size={18} className="user-list-modal-icon like" fill="currentColor" />;
    if (icon === 'users') return <Users size={18} className="user-list-modal-icon" />;
    if (icon === 'following') return <UserCheck size={18} className="user-list-modal-icon" />;
    return null;
  };

  return (
    <Modal title={title} onClose={onClose}>
      {renderIcon() && (
        <div className="user-list-modal-header">
          {renderIcon()}
          <span className="user-list-modal-count">{users.length} {users.length === 1 ? 'person' : 'people'}</span>
        </div>
      )}
      {users.map((user) => (
        <div key={user._id} className="suggestion-item" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
          <div className="suggestion-info">
            <Avatar
              src={user.profilePicture}
              alt="Avatar"
              className="suggestion-avatar"
              style={{ width: '40px', height: '40px' }}
            />
            <Link
              to={`/profile/${user._id}`}
              className="suggestion-username"
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={onClose}
            >
              {user.username}
              <VerifiedBadge show={user.isVerified} />
            </Link>
          </div>
        </div>
      ))}
      {users.length === 0 && emptyMessage && (
        <div className="user-list-modal-empty">
          <Inbox size={28} />
          <span>{emptyMessage}</span>
        </div>
      )}
    </Modal>
  );
};

export default UserListModal;