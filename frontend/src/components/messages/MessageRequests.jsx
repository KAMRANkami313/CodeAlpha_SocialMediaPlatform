import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import VerifiedBadge from '../common/VerifiedBadge';
import { Check, X, Loader2, Inbox } from 'lucide-react';

const MessageRequests = ({ requests, onAccept, onDecline }) => {
  const [actionLoading, setActionLoading] = useState(null);

  const handleAccept = async (requestId) => {
    setActionLoading(requestId);
    try {
      await onAccept(requestId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId) => {
    setActionLoading(requestId);
    try {
      await onDecline(requestId);
    } finally {
      setActionLoading(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="chat-requests-empty">
        <Inbox size={32} />
        <span>No message requests</span>
        <p>When someone you don't follow sends you a message, it'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="chat-requests-list">
      {requests.map((request) => (
        <div key={request._id} className="chat-request-item">
          <Link to={`/profile/${request.sender._id}`} className="chat-request-avatar-link">
            <Avatar
              src={request.sender.profilePicture}
              alt={request.sender.username}
              className="suggestion-avatar"
              style={{ width: '44px', height: '44px' }}
            />
          </Link>
          <div className="chat-request-body">
            <div className="chat-request-header">
              <Link to={`/profile/${request.sender._id}`} className="chat-request-name">
                {request.sender.username}
                <VerifiedBadge show={request.sender.isVerified} size="small" />
              </Link>
              <span className="chat-request-time">
                {new Date(request.createdAt).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </div>
            <p className="chat-request-preview">{request.content}</p>
            <div className="chat-request-actions">
              <button
                className="chat-request-btn accept"
                onClick={() => handleAccept(request._id)}
                disabled={actionLoading === request._id}
              >
                {actionLoading === request._id ? <Loader2 size={13} className="spin" /> : <Check size={13} />}
                Accept
              </button>
              <button
                className="chat-request-btn decline"
                onClick={() => handleDecline(request._id)}
                disabled={actionLoading === request._id}
              >
                <X size={13} />
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageRequests;