import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { POLL_INTERVALS } from '../utils/constants';
import ConversationList from '../components/messages/ConversationList';
import ChatPane from '../components/messages/ChatPane';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);

  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations();
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
      const res = await messageService.getConversation(activePartner._id);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVALS.MESSAGES);
    return () => clearInterval(interval);
  }, [activePartner]);

  const handleMessageSent = (newMessage) => {
    setMessages((prev) => [...prev, newMessage]);
    fetchConversations();
  };

  const handleMessageDeleted = (messageId) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    fetchConversations();
  };

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      <div className="chat-layout">
        <ConversationList
          conversations={conversations}
          activePartner={activePartner}
          onSelectPartner={setActivePartner}
        />
        <ChatPane
          activePartner={activePartner}
          user={user}
          messages={messages}
          onMessageSent={handleMessageSent}
          onMessageDeleted={handleMessageDeleted}
        />
      </div>
    </div>
  );
};

export default Messages;