import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { blockService } from '../../services/blockService';

const BlockedUsersModal = ({ onClose, onUnblocked }) => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlocked = async () => {
      try {
        const res = await blockService.getBlockedUsers();
        setBlockedUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocked();
  }, []);

  const handleUnblock = async (userId) => {
    try {
      await blockService.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(u => u._id !== userId));
      if (onUnblocked) onUnblocked(userId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal title="Blocked Users" onClose={onClose}>
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', color: 'var(--secondary-text)', fontSize: 'var(--text-sm)' }}>
          Loading...
        </div>
      )}
      {!loading && blockedUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-6) 0', color: 'var(--secondary-text)', fontSize: 'var(--text-sm)' }}>
          You haven't blocked anyone.
        </div>
      )}
      {!loading && blockedUsers.map((blockedUser) => (
        <div key={blockedUser._id} className="suggestion-item" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>
          <div className="suggestion-info">
            <Avatar
              src={blockedUser.profilePicture}
              alt="Avatar"
              className="suggestion-avatar"
              style={{ width: '40px', height: '40px' }}
            />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              {blockedUser.username}
              <VerifiedBadge show={blockedUser.isVerified} />
            </span>
          </div>
          <button
            className="btn"
            style={{ width: 'auto', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', background: 'var(--bg-subtle)', color: 'var(--text-color)' }}
            onClick={() => handleUnblock(blockedUser._id)}
          >
            Unblock
          </button>
        </div>
      ))}
    </Modal>
  );
};

export default BlockedUsersModal;