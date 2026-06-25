import { Link } from 'react-router-dom';
import Modal from './Modal';
import Avatar from './Avatar';
import VerifiedBadge from './VerifiedBadge';

const UserListModal = ({ title, users = [], onClose, emptyMessage = null }) => {
  return (
    <Modal title={title} onClose={onClose}>
      {users.map((user) => (
        <div key={user._id} className="suggestion-item" style={{ marginBottom: '15px' }}>
          <div className="suggestion-info">
            <Avatar
              src={user.profilePicture}
              alt="Avatar"
              className="suggestion-avatar"
              style={{ width: '32px', height: '32px' }}
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
        <div style={{ textAlign: 'center', color: '#8e8e8e', fontSize: '14px' }}>
          {emptyMessage}
        </div>
      )}
    </Modal>
  );
};

export default UserListModal;