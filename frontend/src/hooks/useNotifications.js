import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';

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
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      fetchNotifications();
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, fetchNotifications]);

  return { notifications, fetchNotifications };
};

export default useNotifications;