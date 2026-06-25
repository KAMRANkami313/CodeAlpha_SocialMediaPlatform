const User = require('../models/User');
const { createNotification } = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const followUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: 'You cannot follow yourself' });
  }
  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (currentUser.following.includes(req.params.id)) {
    return res.status(400).json({ message: 'You already follow this user' });
  }
  currentUser.following.push(req.params.id);
  targetUser.followers.push(req.user.id);
  await currentUser.save();
  await targetUser.save();

  await createNotification({
    sender: req.user.id,
    receiver: req.params.id,
    type: 'follow'
  });

  res.status(200).json({ message: 'User followed successfully' });
});

const unfollowUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ message: 'You cannot unfollow yourself' });
  }
  const targetUser = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!currentUser.following.includes(req.params.id)) {
    return res.status(400).json({ message: 'You are not following this user' });
  }
  currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
  targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user.id);
  await currentUser.save();
  await targetUser.save();
  res.status(200).json({ message: 'User unfollowed successfully' });
});

module.exports = {
  followUser,
  unfollowUser
};