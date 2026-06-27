import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { messageService } from '../services/messageService';
import ConversationList from '../components/messages/ConversationList';
import ChatPane from '../components/messages/ChatPane';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const sharedPostSentRef = useRef(false);

  const fetchConversations = useCallback(async () => {
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
  }, [location.state]);

  const fetchMessages = useCallback(async () => {
    if (!activePartner) return;
    try {
      const res = await messageService.getConversation(activePartner._id);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [activePartner]);

  useEffect(() => {
    fetchConversations();
    const startWith = location.state?.startChatWith;
    if (startWith) {
      setActivePartner(startWith);
    }
  }, [location.state, fetchConversations]);

  useEffect(() => {
    fetchMessages();
  }, [activePartner, fetchMessages]);

  useEffect(() => {
    if (!socket || !activePartner || !user) return;

    socket.emit('join_conversation', activePartner._id);

    const handleReceiveMessage = (newMessage) => {
      if (
        (newMessage.sender === activePartner._id && newMessage.receiver === user.id) ||
        (newMessage.sender === user.id && newMessage.receiver === activePartner._id)
      ) {
        setMessages(prev => {
          if (prev.some(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        fetchConversations();

        if (newMessage.sender === activePartner._id) {
          socket.emit('messages_read', { sender: activePartner._id });
        }
      }
    };

    const handleMessageDeleted = (data) => {
      setMessages(prev => prev.filter(m => m._id !== data.messageId));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.emit('leave_conversation', activePartner._id);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, activePartner, user, fetchConversations]);

  const handleMessageSent = (newMessage) => {
    setMessages(prev => {
      if (prev.some(m => m._id === newMessage._id)) return prev;
      return [...prev, newMessage];
    });
    fetchConversations();
  };

  const handleMessageDeleted = (messageId) => {
    setMessages(prev => prev.filter(m => m._id !== messageId));
    fetchConversations();
  };

  useEffect(() => {
    const sharedPostId = location.state?.sharedPostId;
    if (!sharedPostId || !activePartner || sharedPostSentRef.current) return;
    sharedPostSentRef.current = true;
    const author = location.state?.sharedPostAuthor;
    const link = `${window.location.origin}/?postId=${sharedPostId}`;
    const text = author
      ? `Check out this post by @${author}: ${link}`
      : `Check out this post: ${link}`;
    (async () => {
      try {
        const res = await messageService.sendMessage(activePartner._id, text);
        handleMessageSent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        window.history.replaceState({}, document.title);
      }
    })();
  }, [location.state, activePartner]);

  const isPartnerOnline = activePartner && onlineUsers && onlineUsers.has(activePartner._id);

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      <div className="chat-layout">
        <ConversationList
          conversations={conversations}
          activePartner={activePartner}
          onSelectPartner={setActivePartner}
          onlineUsers={onlineUsers}
        />
        <ChatPane
          activePartner={activePartner}
          user={user}
          messages={messages}
          onMessageSent={handleMessageSent}
          onMessageDeleted={handleMessageDeleted}
          isPartnerOnline={isPartnerOnline}
        />
      </div>
    </div>
  );
};

export default Messages;