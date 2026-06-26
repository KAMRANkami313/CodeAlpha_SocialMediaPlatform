import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const ConversationList = ({ conversations, activePartner, onSelectPartner, onlineUsers }) => {
  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-title">Chats</div>
      {conversations.map((c) => {
        const isOnline = onlineUsers && onlineUsers.has(c._id);
        return (
          <div
            key={c._id}
            className={`chat-partner-item ${activePartner?._id === c._id ? 'active' : ''}`}
            onClick={() => onSelectPartner(c)}
          >
            <div style={{ position: 'relative' }}>
              <Avatar
                src={c.profilePicture}
                alt="Avatar"
                className="suggestion-avatar"
                style={{ width: '40px', height: '40px' }}
              />
              <span className={`chat-status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              {c.username}
              <VerifiedBadge show={c.isVerified} />
            </div>
          </div>
        );
      })}
      {conversations.length === 0 && (
        <div style={{ padding: 'var(--space-6) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--secondary-text)', textAlign: 'center' }}>
          No active chats
        </div>
      )}
    </div>
  );
};

export default ConversationList;