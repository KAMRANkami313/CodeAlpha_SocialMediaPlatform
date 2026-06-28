import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000
        });

        newSocket.on('connect', () => {
          console.log('Socket connected');
          setIsConnected(true);
          setIsReconnecting(false);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message);
          setIsConnected(false);
          setIsReconnecting(true);
        });

        newSocket.on('reconnect_attempt', (attempt) => {
          console.log(`Reconnection attempt ${attempt}...`);
          setIsReconnecting(true);
        });

        newSocket.on('reconnect', () => {
          console.log('Socket reconnected');
          setIsConnected(true);
          setIsReconnecting(false);
        });

        newSocket.on('reconnect_failed', () => {
          console.error('Socket reconnection failed');
          setIsReconnecting(false);
        });

        newSocket.on('user_online', (userId) => {
          setOnlineUsers(prev => new Set([...prev, userId]));
        });

        newSocket.on('user_offline', (userId) => {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
      }
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setIsReconnecting(false);
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isConnected, isReconnecting }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};