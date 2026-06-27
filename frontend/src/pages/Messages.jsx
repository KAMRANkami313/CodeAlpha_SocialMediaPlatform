import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { messageService } from '../services/messageService';
import ConversationList from '../components/messages/ConversationList';
import ChatPane from '../components/messages/ChatPane';

const MOBILE_BREAKPOINT = 768;

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [shareStatus, setShareStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BREAKPOINT : true
  );
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
      if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
        setSidebarOpen(false);
      }
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

    const handleMessageReaction = (data) => {
      setMessages(prev => prev.map(m =>
        m._id === data.messageId
          ? { ...m, reactions: data.reactions }
          : m
      ));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_reaction', handleMessageReaction);

    return () => {
      socket.emit('leave_conversation', activePartner._id);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_reaction', handleMessageReaction);
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

  const handleMessageReacted = (updatedMessage) => {
    setMessages(prev => prev.map(m =>
      m._id === updatedMessage._id ? updatedMessage : m
    ));
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
    setShareStatus('sending');
    (async () => {
      try {
        const res = await messageService.sendMessage(activePartner._id, text);
        handleMessageSent(res.data);
        setShareStatus('sent');
        setTimeout(() => setShareStatus(null), 2500);
      } catch (err) {
        console.error(err);
        setShareStatus('error');
        setTimeout(() => setShareStatus(null), 4000);
      } finally {
        window.history.replaceState({}, document.title);
      }
    })();
  }, [location.state, activePartner]);

  const handleSelectPartner = (partner) => {
    setActivePartner(partner);
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
      setSidebarOpen(false);
    }
  };

  if (!user) return null;

  const isPartnerOnline = activePartner && onlineUsers && onlineUsers.has(activePartner._id);

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      {shareStatus && (
        <div className={`share-post-toast share-post-toast--${shareStatus}`}>
          {shareStatus === 'sending' && 'Sharing post…'}
          {shareStatus === 'sent' && '✓ Post shared!'}
          {shareStatus === 'error' && '⚠ Could not share post. Is the backend running?'}
        </div>
      )}
      <div className={`chat-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <ConversationList
          conversations={conversations}
          activePartner={activePartner}
          onSelectPartner={handleSelectPartner}
          onlineUsers={onlineUsers}
        />
        <div className="chat-pane-wrapper">
          <div className="chat-toolbar">
            <button
              className="chat-sidebar-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label={sidebarOpen ? 'Hide conversations' : 'Show conversations'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <span className="chat-toolbar-title">
              {activePartner ? `Chat with ${activePartner.username}` : 'Messages'}
            </span>
          </div>
          <ChatPane
            activePartner={activePartner}
            user={user}
            messages={messages}
            onMessageSent={handleMessageSent}
            onMessageDeleted={handleMessageDeleted}
            onMessageReacted={handleMessageReacted}
            isPartnerOnline={isPartnerOnline}
          />
        </div>
      </div>
      {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT && (
        <div
          className="chat-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Messages;