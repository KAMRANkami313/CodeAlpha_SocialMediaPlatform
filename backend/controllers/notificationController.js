const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ receiver: req.user.id })
    .sort({ createdAt: -1 })
    .populate('sender', 'username profilePicture isVerified')
    .populate('post', 'caption');
  res.status(200).json(notifications);
});

const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ receiver: req.user.id, read: false }, { read: true });
  res.status(200).json({ message: 'Notifications marked as read' });
});

module.exports = {
  getNotifications,
  markNotificationsAsRead
};