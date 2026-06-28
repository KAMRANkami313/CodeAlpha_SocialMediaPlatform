const Message = require('../models/Message');
const MessageRequest = require('../models/MessageRequest');
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

  const receiver = await User.findById(receiverId).select('following');
  const receiverFollowsSender = receiver && receiver.following.some(
    (f) => f.toString() === req.user.id
  );

  const existingConversation = await Message.findOne({
    $or: [
      { sender: req.user.id, receiver: receiverId },
      { sender: receiverId, receiver: req.user.id }
    ]
  });

  if (receiverFollowsSender || existingConversation) {
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

    return res.status(201).json(newMessage);
  }

  const existingPending = await MessageRequest.findOne({
    sender: req.user.id,
    receiver: receiverId,
    status: 'pending'
  });

  if (existingPending) {
    existingPending.content = content;
    await existingPending.save();
    return res.status(200).json({
      message: 'Your message is pending. The recipient needs to accept your request to start chatting.',
      isRequest: true,
      request: existingPending
    });
  }

  const newRequest = new MessageRequest({
    sender: req.user.id,
    receiver: receiverId,
    content
  });
  await newRequest.save();

  const io = getIo();
  if (io) {
    io.to(receiverId).emit('new_message_request', {
      _id: newRequest._id,
      sender: { _id: req.user.id },
      content: newRequest.content,
      createdAt: newRequest.createdAt
    });
  }

  res.status(201).json({
    message: 'Your message has been sent as a request. The recipient needs to accept it to start chatting.',
    isRequest: true,
    request: newRequest
  });
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

const getMessageRequests = asyncHandler(async (req, res) => {
  const requests = await MessageRequest.find({
    receiver: req.user.id,
    status: 'pending'
  })
    .populate('sender', 'username profilePicture isVerified')
    .sort({ createdAt: -1 });

  res.status(200).json(requests);
});

const acceptMessageRequest = asyncHandler(async (req, res) => {
  const request = await MessageRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  if (request.receiver.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (request.status !== 'pending') {
    return res.status(400).json({ message: `Request already ${request.status}` });
  }

  request.status = 'accepted';
  await request.save();

  const newMessage = new Message({
    sender: request.sender,
    receiver: request.receiver,
    content: request.content
  });
  await newMessage.save();

  const io = getIo();
  if (io) {
    io.to(request.sender.toString()).emit('receive_message', newMessage);
    io.to(request.receiver.toString()).emit('receive_message', newMessage);

    io.to(request.sender.toString()).emit('request_accepted', {
      requestId: request._id,
      receiverId: request.receiver
    });

    const senderUnread = await Message.countDocuments({ receiver: request.sender, read: false });
    io.to(request.sender.toString()).emit('unread_count_update', senderUnread);
  }

  res.status(200).json({ message: 'Request accepted', messageData: newMessage });
});

const declineMessageRequest = asyncHandler(async (req, res) => {
  const request = await MessageRequest.findById(req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  if (request.receiver.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (request.status !== 'pending') {
    return res.status(400).json({ message: `Request already ${request.status}` });
  }

  request.status = 'declined';
  await request.save();

  res.status(200).json({ message: 'Request declined' });
});

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList,
  deleteMessage,
  getUnreadCount: getUnreadMessagesCount,
  reactToMessage,
  getMessageRequests,
  acceptMessageRequest,
  declineMessageRequest
};