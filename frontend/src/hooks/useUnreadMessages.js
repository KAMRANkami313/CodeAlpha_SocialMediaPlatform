import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../services/messageService';
import { POLL_INTERVALS } from '../utils/constants';

const useUnreadMessages = (user) => {
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
    const interval = setInterval(fetchUnreadMessagesCount, POLL_INTERVALS.UNREAD_MESSAGES);
    return () => clearInterval(interval);
  }, [fetchUnreadMessagesCount]);

  return unreadMessages;
};

export default useUnreadMessages;