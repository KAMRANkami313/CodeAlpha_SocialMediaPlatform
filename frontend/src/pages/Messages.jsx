import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const fetchConversations = async () => {
    try {
      const res = await API.get('/messages/conversations');
      let list = res.data;
      const startWith = location.state?.startChatWith;
      if (startWith) {
        const alreadyExists = list.some(c => c._id === startWith._id);
        if (!alreadyExists) {
          list = [startWith, ...list];
        }
      }
      setConversations(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const startWith = location.state?.startChatWith;
    if (startWith) {
      setActivePartner(startWith);
    }
  }, [location.state]);

  const fetchMessages = async () => {
    if (!activePartner) return;
    try {
      const res = await API.get(`/messages/${activePartner._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activePartner]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activePartner) return;
    try {
      const res = await API.post(`/messages/${activePartner._id}`, { content: text });
      setMessages([...messages, res.data]);
      setText('');
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await API.delete(`/messages/delete/${messageId}`);
      setMessages(messages.filter((m) => m._id !== messageId));
      fetchConversations();
    } catch (err) {
      try {
        await API.delete(`/messages/${activePartner._id}/${messageId}`);
      } catch (innerErr) {
        await API.delete(`/messages/${messageId}`);
      }
      fetchMessages();
      fetchConversations();
    }
  };

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      <div className="chat-layout">
        <div className="chat-sidebar">
          <div style={{ padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #dbdbdb' }}>Chats</div>
          {conversations.map((c) => (
            <div
              key={c._id}
              className={`chat-partner-item ${activePartner?._id === c._id ? 'active' : ''}`}
              onClick={() => setActivePartner(c)}
            >
              {c.profilePicture ? (
                <img
                  src={c.profilePicture}
                  alt="Avatar"
                  className="suggestion-avatar"
                  style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                />
              ) : (
                <div className="suggestion-avatar" style={{ width: '28px', height: '28px' }}></div>
              )}
              <div style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                {c.username}
                {c.isVerified && <span className="verified-badge">✓</span>}
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div style={{ padding: '15px', fontSize: '12px', color: '#8e8e8e', textAlign: 'center' }}>No active chats</div>
          )}
        </div>

        <div className="chat-pane-wrapper">
          {activePartner ? (
            <div className="chat-pane">
              <div className="chat-header" style={{ display: 'flex', alignItems: 'center' }}>
                Converse with {activePartner.username}
                {activePartner.isVerified && <span className="verified-badge">✓</span>}
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
                    <div>{m.content}</div>
                  </div>
                ))}
              </div>
              <form className="chat-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
                <button type="submit">Send</button>
              </form>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8e8e8e' }}>
              Select a chat to begin messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;