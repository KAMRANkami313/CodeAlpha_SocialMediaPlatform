import { Link } from 'react-router-dom';
import Modal from './Modal';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';

const UserListModal = ({ title, users = [], onClose, emptyMessage = null }) => {
  return (
    <Modal title={title} onClose={onClose}>
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
        <div style={{ textAlign: 'center', color: 'var(--secondary-text)', fontSize: 'var(--text-sm)', padding: 'var(--space-6) 0' }}>
          {emptyMessage}
        </div>
      )}
    </Modal>
  );
};

export default UserListModal;