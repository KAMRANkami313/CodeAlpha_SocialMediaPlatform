import { useState, useEffect, useRef, useContext } from 'react';
import { messageService } from '../../services/messageService';
import { uploadService } from '../../services/uploadService';
import { SocketContext } from '../../context/SocketContext';
import VerifiedBadge from '../common/VerifiedBadge';

const isImageURL = (url) => {
  return (
    url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null ||
    url.startsWith('http://localhost:5000/uploads/') ||
    url.startsWith('https://res.cloudinary.com/') ||
    url.startsWith('https://images.unsplash.com') ||
    url.startsWith('https://picsum.photos')
  );
};

const ChatPane = ({ activePartner, user, messages, onMessageSent, onMessageDeleted, isPartnerOnline }) => {
  const { socket } = useContext(SocketContext);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerRead, setPartnerRead] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, uploading]);

  useEffect(() => {
    if (!socket || !activePartner) return;

    const handleTyping = (data) => {
      if (data.sender === activePartner._id) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (data) => {
      if (data.reader === activePartner._id) {
        setPartnerRead(true);
      }
    };

    socket.on('typing', handleTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('typing', handleTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, activePartner]);

  useEffect(() => {
    setPartnerRead(false);
  }, [messages]);

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket || !activePartner) return;

    if (text.length === 0 && e.target.value.length > 0) {
      socket.emit('typing', { receiver: activePartner._id, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { receiver: activePartner._id, isTyping: false });
    }, 2000);

    if (e.target.value.length === 0) {
      socket.emit('typing', { receiver: activePartner._id, isTyping: false });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activePartner) return;
    try {
      if (socket) {
        socket.emit('typing', { receiver: activePartner._id, isTyping: false });
      }
      const res = await messageService.sendMessage(activePartner._id, text);
      onMessageSent(res.data);
      setText('');
      setPartnerRead(false);
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
      setPartnerRead(false);
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

  const lastMessage = messages[messages.length - 1];
  const showReadReceipt = lastMessage && lastMessage.sender === user.id && partnerRead;

  return (
    <div className="chat-pane-wrapper">
      <div className="chat-pane">
        <div className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            Converse with {activePartner.username}
            <VerifiedBadge show={activePartner.isVerified} />
          </div>
          <span className={`chat-status-dot ${isPartnerOnline ? 'online' : 'offline'}`}></span>
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
                />
              ) : (
                <div>{m.content}</div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble theirs typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          {uploading && (
            <div className="chat-bubble mine" style={{ opacity: 0.6 }}>
              <div>Uploading image...</div>
            </div>
          )}
          {showReadReceipt && (
            <div className="chat-read-receipt">✓✓ Read</div>
          )}
          <div ref={messagesEndRef} />
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
            onChange={handleTyping}
            required
          />
          <button type="submit" disabled={uploading}>Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatPane;