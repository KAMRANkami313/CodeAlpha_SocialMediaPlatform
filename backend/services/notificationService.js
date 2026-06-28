const Notification = require('../models/Notification');
const { getIo } = require('../config/socket');

const DEDUPE_WINDOW_MS = 60 * 60 * 1000;

const createNotification = async ({ sender, receiver, type, post = null }) => {
  try {
    if (String(sender) === String(receiver)) return null;

    const dedupeCutoff = new Date(Date.now() - DEDUPE_WINDOW_MS);
    const dedupeFilter = { sender, receiver, type, updatedAt: { $gte: dedupeCutoff } };
    if (post) {
      dedupeFilter.post = post;
    } else {
      dedupeFilter.post = null;
    }

    const existing = await Notification.findOne(dedupeFilter);

    let notification;
    if (existing) {
      existing.read = false;
      await existing.save();
      notification = existing;
    } else {
      notification = new Notification({ sender, receiver, type, post });
      await notification.save();
    }

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'username profilePicture isVerified')
      .populate('post', 'caption');

    const io = getIo();
    if (io) {
      io.to(receiver).emit('new_notification', populated);

      const unreadCount = await Notification.countDocuments({ receiver, read: false });
      io.to(receiver).emit('notification_count_update', unreadCount);
    }

    return populated;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };