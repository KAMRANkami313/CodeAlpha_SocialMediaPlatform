const Message = require('../models/Message');
const User = require('../models/User');
const Block = require('../models/Block');
const asyncHandler = require('../utils/asyncHandler');
const { getIo } = require('../config/socket');

const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const receiverId = req.params.receiverId;

  const blockExists = await Block.findOne({
    $or: [
      { blocker: req.user.id, blocked: receiverId },
      { blocker: receiverId, blocked: req.user.id }
    ]
  });
  if (blockExists) {
    return res.status(403).json({ message: 'Cannot send message due to a block' });
  }

  const newMessage = new Message({
    sender: req.user.id,
    receiver: receiverId,
    content
  });
  await newMessage.save();

  const io = getIo();
  if (io) {
    io.to(receiverId).emit('receive_message', newMessage);

    const unreadCount = await Message.countDocuments({ receiver: receiverId, read: false });
    io.to(receiverId).emit('unread_count_update', unreadCount);
  }

  res.status(201).json(newMessage);
});

const getConversation = asyncHandler(async (req, res) => {
  const otherUserId = req.params.otherUserId;
  await Message.updateMany(
    { sender: otherUserId, receiver: req.user.id, read: false },
    { read: true }
  );
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: otherUserId },
      { sender: otherUserId, receiver: req.user.id }
    ]
  }).sort({ createdAt: 1 });

  const io = getIo();
  if (io) {
    const unreadCount = await Message.countDocuments({ receiver: req.user.id, read: false });
    io.to(req.user.id).emit('unread_count_update', unreadCount);
  }

  res.status(200).json(messages);
});

const getConversationsList = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }]
  }).populate('sender receiver', 'username profilePicture isVerified');

  const usersMap = {};
  messages.forEach((msg) => {
    const partner = msg.sender._id.toString() === userId ? msg.receiver : msg.sender;
    usersMap[partner._id.toString()] = partner;
  });

  res.status(200).json(Object.values(usersMap));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }
  if (message.sender.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Unauthorized action' });
  }

  const receiverId = message.receiver.toString();
  await Message.findByIdAndDelete(req.params.messageId);

  const io = getIo();
  if (io) {
    io.to(receiverId).emit('message_deleted', { messageId: req.params.messageId });
  }

  res.status(200).json({ message: 'Message deleted successfully' });
});

const getUnreadMessagesCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({ receiver: req.user.id, read: false });
  res.status(200).json({ unreadCount: count });
});

const reactToMessage = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  const senderId = message.sender.toString();
  const receiverId = message.receiver.toString();
  if (senderId !== req.user.id && receiverId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to react to this message' });
  }

  const existingIndex = message.reactions.findIndex(
    (r) => r.user.toString() === req.user.id
  );

  if (existingIndex >= 0) {
    if (message.reactions[existingIndex].emoji === emoji) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions[existingIndex].emoji = emoji;
    }
  } else {
    message.reactions.push({ user: req.user.id, emoji });
  }

  await message.save();

  const otherUserId = senderId === req.user.id ? receiverId : senderId;
  const io = getIo();
  if (io) {
    io.to(otherUserId).emit('message_reaction', {
      messageId: message._id,
      reactions: message.reactions
    });
  }

  res.status(200).json(message);
});

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList,
  deleteMessage,
  getUnreadCount: getUnreadMessagesCount,
  reactToMessage
};