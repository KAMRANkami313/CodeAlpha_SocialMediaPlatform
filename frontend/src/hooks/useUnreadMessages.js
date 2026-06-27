import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import { useSocket } from '../context/SocketContext';

const useUnreadMessages = (user) => {
  const { socket } = useSocket();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchUnreadMessagesCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await messageService.getUnreadCount();
      setUnreadMessages(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadMessagesCount();
  }, [fetchUnreadMessagesCount]);

  useEffect(() => {
    if (!socket) return;

    const handleUnreadCountUpdate = (count) => {
      setUnreadMessages(count);
    };

    socket.on('unread_count_update', handleUnreadCountUpdate);

    return () => {
      socket.off('unread_count_update', handleUnreadCountUpdate);
    };
  }, [socket]);

  return unreadMessages;
};

export default useUnreadMessages;