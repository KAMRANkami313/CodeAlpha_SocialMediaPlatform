const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const receiverId = req.params.receiverId;
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.otherUserId;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversationsList = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList
};