const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const filter = { receiver: req.user.id };
  if (req.query.unread === 'true') {
    filter.read = false;
  }

  const limit = Math.min(50, parseInt(req.query.limit) || 30);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'username profilePicture isVerified')
    .populate('post', 'caption');

  res.status(200).json(notifications);
});

const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ receiver: req.user.id, read: false }, { read: true });
  res.status(200).json({ message: 'Notifications marked as read' });
});

const markSingleAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  if (notification.receiver.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  notification.read = true;
  await notification.save();
  res.status(200).json({ message: 'Notification marked as read', notification });
});

module.exports = {
  getNotifications,
  markNotificationsAsRead,
  markSingleAsRead
};