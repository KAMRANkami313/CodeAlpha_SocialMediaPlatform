const Message = require('../models/Message');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const receiverId = req.params.receiverId;
  const newMessage = new Message({
    sender: req.user.id,
    receiver: receiverId,
    content
  });
  await newMessage.save();
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
  await Message.findByIdAndDelete(req.params.messageId);
  res.status(200).json({ message: 'Message deleted successfully' });
});

const getUnreadMessagesCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({ receiver: req.user.id, read: false });
  res.status(200).json({ unreadCount: count });
});

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList,
  deleteMessage,
  getUnreadCount: getUnreadMessagesCount
};