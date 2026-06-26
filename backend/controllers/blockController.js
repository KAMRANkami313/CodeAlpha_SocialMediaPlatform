const Block = require('../models/Block');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const blockUser = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.user.id;

  if (currentUserId === targetUserId) {
    return res.status(400).json({ message: 'You cannot block yourself' });
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }

  const existingBlock = await Block.findOne({ blocker: currentUserId, blocked: targetUserId });
  if (existingBlock) {
    return res.status(400).json({ message: 'User is already blocked' });
  }

  await Block.create({ blocker: currentUserId, blocked: targetUserId });

  await User.updateOne(
    { _id: currentUserId },
    { $pull: { following: targetUserId } }
  );
  await User.updateOne(
    { _id: targetUserId },
    { $pull: { followers: currentUserId } }
  );

  res.status(200).json({ message: 'User blocked successfully' });
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.user.id;

  const result = await Block.deleteOne({ blocker: currentUserId, blocked: targetUserId });
  if (result.deletedCount === 0) {
    return res.status(400).json({ message: 'User is not blocked' });
  }

  res.status(200).json({ message: 'User unblocked successfully' });
});

const getBlockedUsers = asyncHandler(async (req, res) => {
  const blocks = await Block.find({ blocker: req.user.id })
    .populate('blocked', 'username profilePicture isVerified bio')
    .sort({ createdAt: -1 });

  const blockedUsers = blocks.map(b => b.blocked);
  res.status(200).json(blockedUsers);
});

const checkBlockStatus = asyncHandler(async (req, res) => {
  const { id: targetUserId } = req.params;
  const currentUserId = req.user.id;

  const block = await Block.findOne({
    $or: [
      { blocker: currentUserId, blocked: targetUserId },
      { blocker: targetUserId, blocked: currentUserId }
    ]
  });

  res.status(200).json({
    isBlocked: !!block,
    blockedByMe: block ? block.blocker.toString() === currentUserId : false
  });
});

module.exports = {
  blockUser,
  unblockUser,
  getBlockedUsers,
  checkBlockStatus
};