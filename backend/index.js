const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
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
const authRoutes = require('./routes/authRoutes');
const twoFactorRoutes = require('./routes/twoFactorRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173'
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
  allowedOrigins.push(frontendUrl);
}

if (process.env.VERCEL_URL) {
  const vercelUrl = `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  allowedOrigins.push(vercelUrl);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true
};

connectDB();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));

app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'SocialApp API',
    status: 'running',
    version: '1.0.0',
    docs: '/api/posts, /api/users, /api/messages'
  });
});

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
app.use('/api/auth', authRoutes);
app.use('/api/2fa', twoFactorRoutes);
app.use('/api/activity-log', activityLogRoutes);

app.use(notFound);
app.use(errorHandler);

const io = initSocket(server, allowedOrigins);
app.set('io', io);

const PORT = env.PORT || process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});