import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { POLL_INTERVALS } from '../utils/constants';

const useNotifications = (user) => {
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

  return { notifications, fetchNotifications };
};

export default useNotifications;