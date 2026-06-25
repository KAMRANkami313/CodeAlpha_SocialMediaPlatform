const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const saveUnsavePost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.savedPosts.includes(req.params.postId)) {
    user.savedPosts = user.savedPosts.filter(id => id.toString() !== req.params.postId);
    await user.save();
    return res.status(200).json({ message: 'Post unsaved successfully', savedPosts: user.savedPosts });
  } else {
    user.savedPosts.push(req.params.postId);
    await user.save();
    return res.status(200).json({ message: 'Post saved successfully', savedPosts: user.savedPosts });
  }
});

const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(200).json([]);
  }
  const users = await User.find({
    username: { $regex: query, $options: 'i' }
  }).select('username profilePicture bio isVerified');
  res.status(200).json(users);
});

const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);
  const excludedUsers = [...currentUser.following, req.user.id];
  const suggestions = await User.find({ _id: { $nin: excludedUsers } })
    .select('username profilePicture bio isVerified lastActivityTimestamp')
    .limit(5);
  res.status(200).json(suggestions);
});

const registerActivityPing = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { lastActivityTimestamp: Date.now() });
  res.status(200).json({ status: 'active' });
});

module.exports = {
  saveUnsavePost,
  searchUsers,
  getSuggestedUsers,
  registerActivityPing
};