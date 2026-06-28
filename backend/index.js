const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { startScheduler } = require('./utils/scheduler');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const storyRoutes = require('./routes/storyRoutes');
const searchRoutes = require('./routes/searchRoutes');
const blockRoutes = require('./routes/blockRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

connectDB();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api', apiLimiter);

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const io = initSocket(server, corsOrigin);
app.set('io', io);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  startScheduler();
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});