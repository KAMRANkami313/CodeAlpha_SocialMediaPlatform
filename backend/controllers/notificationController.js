const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username profilePicture isVerified')
      .populate('post', 'caption');
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ receiver: req.user.id, read: false }, { read: true });
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markNotificationsAsRead
};