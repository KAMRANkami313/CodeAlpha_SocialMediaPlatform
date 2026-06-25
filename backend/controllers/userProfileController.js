const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  let userProfile = await User.findById(req.params.id);
  if (!userProfile) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.user && req.user.id !== req.params.id && !userProfile.views.includes(req.user.id)) {
    userProfile.views.push(req.user.id);
    await userProfile.save();
  }

  userProfile = await User.findById(req.params.id)
    .select('-password')
    .populate('followers', 'username profilePicture isVerified lastActivityTimestamp')
    .populate('following', 'username profilePicture isVerified lastActivityTimestamp')
    .populate({
      path: 'savedPosts',
      populate: {
        path: 'user',
        select: 'username profilePicture isVerified lastActivityTimestamp'
      }
    });

  res.status(200).json(userProfile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { username, email, bio, profilePicture, isVerified } = req.body;

  if (username) {
    const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
  }

  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { username, email, bio, profilePicture, isVerified },
    { new: true }
  ).select('-password');
  res.status(200).json(user);
});

module.exports = {
  getProfile,
  updateProfile
};