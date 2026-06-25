import { useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { POLL_INTERVALS } from '../utils/constants';

const useActivityHeartbeat = (user) => {
  const transmitHeartbeat = useCallback(async () => {
    if (!user) return;
    try {
      await userService.ping();
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    transmitHeartbeat();
    const interval = setInterval(transmitHeartbeat, POLL_INTERVALS.HEARTBEAT);
    return () => clearInterval(interval);
  }, [transmitHeartbeat]);
};

export default useActivityHeartbeat;