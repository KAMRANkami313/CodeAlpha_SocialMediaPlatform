const Notification = require('../models/Notification');
const { getIo } = require('../config/socket');

const createNotification = async ({ sender, receiver, type, post = null }) => {
  try {
    const notification = new Notification({ sender, receiver, type, post });
    await notification.save();

    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'username profilePicture isVerified')
      .populate('post', 'caption');

    const io = getIo();
    if (io) {
      io.to(receiver.toString()).emit('new_notification', populatedNotification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };