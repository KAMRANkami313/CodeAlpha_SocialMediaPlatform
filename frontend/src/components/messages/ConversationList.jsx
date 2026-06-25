import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';

const ConversationList = ({ conversations, activePartner, onSelectPartner }) => {
  return (
    <div className="chat-sidebar">
      <div style={{ padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #dbdbdb' }}>Chats</div>
      {conversations.map((c) => (
        <div
          key={c._id}
          className={`chat-partner-item ${activePartner?._id === c._id ? 'active' : ''}`}
          onClick={() => onSelectPartner(c)}
        >
          <Avatar
            src={c.profilePicture}
            alt="Avatar"
            className="suggestion-avatar"
            style={{ width: '28px', height: '28px' }}
          />
          <div style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            {c.username}
            <VerifiedBadge show={c.isVerified} />
          </div>
        </div>
      ))}
      {conversations.length === 0 && (
        <div style={{ padding: '15px', fontSize: '12px', color: '#8e8e8e', textAlign: 'center' }}>No active chats</div>
      )}
    </div>
  );
};

export default ConversationList;