import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { messageService } from '../services/messageService';
import ConversationList from '../components/messages/ConversationList';
import ChatPane from '../components/messages/ChatPane';
import MessageRequests from '../components/messages/MessageRequests';
import { PanelLeftClose, PanelLeftOpen, Check, Loader2, AlertCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [requestPendingMessage, setRequestPendingMessage] = useState(false);
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

  const fetchRequests = useCallback(async () => {
    try {
      const res = await messageService.getMessageRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

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
    fetchRequests();
    const startWith = location.state?.startChatWith;
    if (startWith) {
      setActivePartner(startWith);
      if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
        setSidebarOpen(false);
      }
    }
  }, [location.state, fetchConversations, fetchRequests]);

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

    const handleNewRequest = () => {
      fetchRequests();
    };

    const handleRequestAccepted = (data) => {
      fetchConversations();
      if (data.receiverId) {
        messageService.getProfile(data.receiverId).then(res => {
          setActivePartner(res.data);
        }).catch(() => {});
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('message_reaction', handleMessageReaction);
    socket.on('new_message_request', handleNewRequest);
    socket.on('request_accepted', handleRequestAccepted);

    return () => {
      socket.emit('leave_conversation', activePartner._id);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('message_reaction', handleMessageReaction);
      socket.off('new_message_request', handleNewRequest);
      socket.off('request_accepted', handleRequestAccepted);
    };
  }, [socket, activePartner, user, fetchConversations, fetchRequests]);

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

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await messageService.acceptMessageRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
      fetchConversations();
      const newMessage = res.data.messageData;
      if (newMessage) {
        const partner = requests.find(r => r._id === requestId)?.sender;
        if (partner) {
          setActivePartner(partner);
          setMessages([newMessage]);
          setSidebarOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await messageService.declineMessageRequest(requestId);
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err) {
      console.error(err);
    }
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
        if (res.data && !res.data.isRequest && res.data._id) {
          handleMessageSent(res.data);
          setShareStatus('sent');
        } else if (res.data && res.data.isRequest) {
          setShareStatus('sent');
          setRequestPendingMessage(true);
        } else {
          setShareStatus('sent');
        }
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
    setRequestPendingMessage(false);
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT) {
      setSidebarOpen(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const isPartnerOnline = activePartner && onlineUsers && onlineUsers.has(activePartner._id);
  const requestCount = requests.length;

  return (
    <div className="container" style={{ maxWidth: '935px' }}>
      {shareStatus && (
        <div className={`share-post-toast share-post-toast--${shareStatus}`}>
          {shareStatus === 'sending' && <><Loader2 size={14} className="spin" /> Sharing post…</>}
          {shareStatus === 'sent' && <><Check size={14} /> Post shared!</>}
          {shareStatus === 'error' && <><AlertCircle size={14} /> Could not share post. Is the backend running?</>}
        </div>
      )}
      <div className={`chat-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <ConversationList
          conversations={conversations}
          activePartner={activePartner}
          onSelectPartner={handleSelectPartner}
          onlineUsers={onlineUsers}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          requestCount={requestCount}
        >
          <MessageRequests
            requests={requests}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        </ConversationList>
        <div className="chat-pane-wrapper">
          <div className="chat-toolbar">
            <button
              className="chat-sidebar-toggle"
              onClick={() => setSidebarOpen(o => !o)}
              aria-label={sidebarOpen ? 'Hide conversations' : 'Show conversations'}
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
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
            isRequestMode={requestPendingMessage}
            requestPendingMessage={requestPendingMessage}
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