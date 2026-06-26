import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
          console.log('Socket connected');
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
    <SocketContext.Provider value={{ socket, onlineUsers }}>
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