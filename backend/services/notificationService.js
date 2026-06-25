const Notification = require('../models/Notification');

const createNotification = async ({ sender, receiver, type, post = null }) => {
  try {
    const notification = new Notification({ sender, receiver, type, post });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };