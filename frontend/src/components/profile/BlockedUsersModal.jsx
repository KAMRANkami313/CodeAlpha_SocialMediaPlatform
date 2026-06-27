import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { blockService } from '../../services/blockService';
import { ShieldBan, Unlock, Loader2, Inbox } from 'lucide-react';

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
        <div className="blocked-loading">
          <Loader2 size={20} className="spin" />
          <span>Loading...</span>
        </div>
      )}
      {!loading && blockedUsers.length === 0 && (
        <div className="blocked-empty">
          <ShieldBan size={32} />
          <span>You haven't blocked anyone.</span>
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
            className="btn blocked-unblock-btn"
            onClick={() => handleUnblock(blockedUser._id)}
          >
            <Unlock size={13} />
            Unblock
          </button>
        </div>
      ))}
    </Modal>
  );
};

export default BlockedUsersModal;