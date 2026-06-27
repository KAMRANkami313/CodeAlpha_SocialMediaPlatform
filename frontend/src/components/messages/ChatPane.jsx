import { useState, useEffect, useRef, useContext } from 'react';
import { messageService } from '../../services/messageService';
import { uploadService } from '../../services/uploadService';
import { SocketContext } from '../../context/SocketContext';
import VerifiedBadge from '../common/VerifiedBadge';
import {
  X,
  Smile,
  Paperclip,
  Send,
  Download,
  ExternalLink,
  Loader2,
  CheckCheck,
  MessageSquare
} from 'lucide-react';

const REACTIONS = ['❤️', '😂', '👍', '😮', '😢', '🙏'];

const isImageURL = (url) => {
  return (
    url.match(/\.(jpeg|jpg|gif|png|webp)$/) != null ||
    url.startsWith('http://localhost:5000/uploads/') ||
    url.startsWith('https://res.cloudinary.com/') ||
    url.startsWith('https://images.unsplash.com') ||
    url.startsWith('https://picsum.photos')
  );
};

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

const linkify = (text) => {
  const parts = text.split(URL_PATTERN);
  return parts.map((part, i) => {
    if (part && part.match(URL_PATTERN)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-link"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const aggregateReactions = (reactions, currentUserId) => {
  if (!reactions || reactions.length === 0) return [];
  const counts = {};
  reactions.forEach((r) => {
    const userId = r.user?._id || r.user;
    const uid = String(userId);
    if (!counts[r.emoji]) counts[r.emoji] = { emoji: r.emoji, count: 0, mine: false };
    counts[r.emoji].count += 1;
    if (uid === String(currentUserId)) counts[r.emoji].mine = true;
  });
  return Object.values(counts);
};

const ChatPane = ({
  activePartner,
  user,
  messages,
  onMessageSent,
  onMessageDeleted,
  onMessageReacted,
  isPartnerOnline
}) => {
  const { socket } = useContext(SocketContext);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerRead, setPartnerRead] = useState(false);
  const [pickerFor, setPickerFor] = useState(null);
  const [lightbox, setLightbox] = useState(null);
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

  useEffect(() => {
    setPickerFor(null);
  }, [activePartner]);

  useEffect(() => {
    if (!lightbox) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [lightbox]);

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

  const handleReact = async (messageId, emoji) => {
    setPickerFor(null);
    try {
      const res = await messageService.reactToMessage(messageId, emoji);
      onMessageReacted(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadImage = (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-image-${Date.now()}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!activePartner) {
    return (
      <div className="chat-pane-wrapper">
        <div className="chat-empty-state">
          <MessageSquare size={40} />
          <span>Select a chat to begin messaging</span>
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
          {messages.map((m) => {
            const isImage = isImageURL(m.content);
            const aggregated = aggregateReactions(m.reactions, user.id);
            return (
              <div
                key={m._id}
                className={`chat-bubble-row ${m.sender === user.id ? 'mine' : 'theirs'}`}
              >
                <div
                  className={`chat-bubble ${m.sender === user.id ? 'mine' : 'theirs'}`}
                  style={{ position: 'relative' }}
                >
                  {m.sender === user.id && (
                    <button
                      className="chat-delete-btn"
                      onClick={() => handleDeleteMessage(m._id)}
                      aria-label="Delete message"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {isImage ? (
                    <img
                      src={m.content}
                      alt="Shared media"
                      className="chat-image"
                      onClick={() => setLightbox(m.content)}
                      style={{ cursor: 'zoom-in' }}
                    />
                  ) : (
                    <div>{linkify(m.content)}</div>
                  )}

                  <button
                    className="chat-react-btn"
                    onClick={() => setPickerFor(pickerFor === m._id ? null : m._id)}
                    aria-label="React to message"
                    type="button"
                  >
                    <Smile size={14} />
                  </button>

                  {pickerFor === m._id && (
                    <div className="chat-reaction-picker">
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="chat-reaction-picker-item"
                          onClick={() => handleReact(m._id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {aggregated.length > 0 && (
                  <div className={`chat-bubble-reactions ${m.sender === user.id ? 'mine' : 'theirs'}`}>
                    {aggregated.map((r) => (
                      <span
                        key={r.emoji}
                        className={`chat-reaction-pill ${r.mine ? 'mine' : ''}`}
                      >
                        {r.emoji} {r.count > 1 ? r.count : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {isTyping && (
            <div className="chat-bubble theirs typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          {uploading && (
            <div className="chat-bubble mine chat-uploading-bubble">
              <Loader2 size={14} className="spin" />
              <span>Uploading image...</span>
            </div>
          )}
          {showReadReceipt && (
            <div className="chat-read-receipt">
              <CheckCheck size={13} />
              Read
            </div>
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
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
            required
          />
          <button type="submit" disabled={uploading} aria-label="Send message" className="chat-send-btn">
            <Send size={18} />
          </button>
        </form>
      </div>

      {lightbox && (
        <div
          className="chat-image-lightbox"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            className="chat-image-lightbox-close"
            onClick={() => setLightbox(null)}
            aria-label="Close preview"
          >
            <X size={22} />
          </button>
          <div className="chat-image-lightbox-actions" onClick={(e) => e.stopPropagation()}>
            <a
              href={lightbox}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-image-lightbox-action-btn"
            >
              <ExternalLink size={14} />
              Open in new tab
            </a>
            <button
              type="button"
              className="chat-image-lightbox-action-btn"
              onClick={() => handleDownloadImage(lightbox)}
            >
              <Download size={14} />
              Download
            </button>
          </div>
          <img
            src={lightbox}
            alt="Full size shared media"
            className="chat-image-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ChatPane;