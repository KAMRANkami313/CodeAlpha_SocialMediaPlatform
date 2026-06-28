const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map();
let ioInstance = null;

const initSocket = (server, allowedOrigins) => {
  const origins = Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins];

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by Socket.io CORS`));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);

    socket.join(userId);

    io.emit('user_online', userId);

    socket.on('join_conversation', (otherUserId) => {
      const room = [userId, otherUserId].sort().join('_');
      socket.join(room);
    });

    socket.on('leave_conversation', (otherUserId) => {
      const room = [userId, otherUserId].sort().join('_');
      socket.leave(room);
    });

    socket.on('send_message', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', data);
      }
      const room = [userId, data.receiver].sort().join('_');
      socket.to(room).emit('receive_message', data);
    });

    socket.on('message_deleted', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message_deleted', data);
      }
    });

    socket.on('typing', (data) => {
      const receiverSocketId = onlineUsers.get(data.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing', { sender: userId, isTyping: data.isTyping });
      }
    });

    socket.on('messages_read', (data) => {
      const senderSocketId = onlineUsers.get(data.sender);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messages_read', { reader: userId });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user_offline', userId);
    });
  });

  return io;
};

const isUserOnline = (userId) => onlineUsers.has(userId);

const getIo = () => ioInstance;

module.exports = { initSocket, isUserOnline, getIo };