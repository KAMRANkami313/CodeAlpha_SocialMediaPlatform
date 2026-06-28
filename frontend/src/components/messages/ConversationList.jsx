import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { MessageCircle, Inbox } from 'lucide-react';

const ConversationList = ({
  conversations,
  activePartner,
  onSelectPartner,
  onlineUsers,
  activeTab,
  onTabChange,
  requestCount,
  children
}) => {
  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-tabs">
        <button
          className={`chat-sidebar-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onTabChange('all')}
        >
          <MessageCircle size={14} />
          Chats
        </button>
        <button
          className={`chat-sidebar-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => onTabChange('requests')}
        >
          <Inbox size={14} />
          Requests
          {requestCount > 0 && <span className="chat-request-badge">{requestCount}</span>}
        </button>
      </div>

      {activeTab === 'all' ? (
        <>
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
            <div className="chat-sidebar-empty">
              <MessageCircle size={28} />
              <span>No active chats</span>
            </div>
          )}
        </>
      ) : (
        children
      )}
    </div>
  );
};

export default ConversationList;