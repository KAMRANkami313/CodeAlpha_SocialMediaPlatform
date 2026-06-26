import { useState, useRef } from 'react';
import { messageService } from '../../services/messageService';
import { uploadService } from '../../services/uploadService';
import VerifiedBadge from '../common/VerifiedBadge';

const isImageURL = (url) => {
  return (
    url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null ||
    url.startsWith('http://localhost:5000/uploads/') ||
    url.startsWith('https://images.unsplash.com') ||
    url.startsWith('https://picsum.photos')
  );
};

const ChatPane = ({ activePartner, user, messages, onMessageSent, onMessageDeleted }) => {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activePartner) return;
    setUploading(true);
    try {
      const uploadRes = await uploadService.uploadImage(file);
      const imageUrl = uploadRes.data.imageUrl;
      const res = await messageService.sendMessage(activePartner._id, imageUrl);
      onMessageSent(res.data);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--secondary-text)', fontSize: 'var(--text-sm)' }}>
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
              style={{ position: 'relative' }}
            >
              {m.sender === user.id && (
                <button
                  className="chat-delete-btn"
                  onClick={() => handleDeleteMessage(m._id)}
                  aria-label="Delete message"
                >
                  ×
                </button>
              )}
              {isImageURL(m.content) ? (
                <img
                  src={m.content}
                  alt="Shared media"
                  className="chat-image"
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
          {uploading && (
            <div className="chat-bubble mine" style={{ opacity: 0.6 }}>
              <div>Uploading image...</div>
            </div>
          )}
        </div>
        <form className="chat-form" onSubmit={handleSendMessage}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Send image"
          >
            📷
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button type="submit" disabled={uploading}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPane;