import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';
import { POLL_INTERVALS } from '../utils/constants';

const useNotifications = (user) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVALS.NOTIFICATIONS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = () => {
      fetchNotifications();
    };

    const handleCountUpdate = () => {
      fetchNotifications();
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('notification_count_update', handleCountUpdate);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_count_update', handleCountUpdate);
    };
  }, [socket, user, fetchNotifications]);

  const markAsRead = useCallback(async () => {
    try {
      await notificationService.markAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markSingleAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markSingleAsRead(notificationId);
      setNotifications(prev => prev.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { notifications, fetchNotifications, markAsRead, markSingleAsRead };
};

export default useNotifications;