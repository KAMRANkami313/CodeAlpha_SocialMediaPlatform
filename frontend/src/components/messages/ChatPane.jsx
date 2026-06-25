import { useState } from 'react';
import { messageService } from '../../services/messageService';
import VerifiedBadge from '../common/VerifiedBadge';

const isImageURL = (url) => {
  return (
    url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null ||
    url.startsWith('https://images.unsplash.com') ||
    url.startsWith('https://picsum.photos')
  );
};

const ChatPane = ({ activePartner, user, messages, onMessageSent, onMessageDeleted }) => {
  const [text, setText] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activePartner) return;
    try {
      const res = await messageService.sendMessage(activePartner._id, text);
      onMessageSent(res.data);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      onMessageDeleted(messageId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!activePartner) {
    return (
      <div className="chat-pane-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8e8e8e' }}>
          Select a chat to begin messaging
        </div>
      </div>
    );
  }

  return (
    <div className="chat-pane-wrapper">
      <div className="chat-pane">
        <div className="chat-header" style={{ display: 'flex', alignItems: 'center' }}>
          Converse with {activePartner.username}
          <VerifiedBadge show={activePartner.isVerified} />
        </div>
        <div className="chat-messages">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`chat-bubble ${m.sender === user.id ? 'mine' : 'theirs'}`}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              {m.sender === user.id && (
                <button
                  className="delete-btn"
                  style={{ fontSize: '10px', color: '#8e8e8e', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}
                  onClick={() => handleDeleteMessage(m._id)}
                >
                  ×
                </button>
              )}
              {isImageURL(m.content) ? (
                <img
                  src={m.content}
                  alt="Shared media"
                  style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
                  onLoad={() => {
                    const chatContainer = document.querySelector('.chat-messages');
                    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                  }}
                />
              ) : (
                <div>{m.content}</div>
              )}
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message or paste image URL..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPane;