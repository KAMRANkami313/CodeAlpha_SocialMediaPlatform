const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Comment = require('../models/Comment');
const Story = require('../models/Story');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    suspendedUsers,
    totalPosts,
    archivedPosts,
    totalComments,
    totalStories,
    pendingReports,
    resolvedReports
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isSuspended: true }),
    Post.countDocuments({}),
    Post.countDocuments({ isArchived: true }),
    Comment.countDocuments({}),
    Story.countDocuments({}),
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments({ status: 'resolved' })
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newPostsThisWeek = await Post.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
  const newReportsThisWeek = await Report.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

  const topReportedReasons = await Report.aggregate([
    { $group: { _id: '$reason', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.status(200).json({
    totals: {
      users: totalUsers,
      suspendedUsers,
      posts: totalPosts,
      archivedPosts,
      comments: totalComments,
      stories: totalStories,
      pendingReports,
      resolvedReports
    },
    weekly: {
      newUsers: newUsersThisWeek,
      newPosts: newPostsThisWeek,
      newReports: newReportsThisWeek
    },
    topReportedReasons: topReportedReasons.map(r => ({ reason: r._id, count: r.count }))
  });
});

const getReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const status = req.query.status;

  const filter = {};
  if (status && ['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
    filter.status = status;
  }

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reporter', 'username profilePicture')
      .populate({
        path: 'post',
        populate: { path: 'user', select: 'username profilePicture isSuspended' }
      })
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter)
  ]);

  res.status(200).json({
    data: reports,
    page,
    totalPages: Math.ceil(total / limit),
    totalReports: total,
    hasMore: page * limit < total
  });
});

const takeReportAction = asyncHandler(async (req, res) => {
  const { action, note } = req.body;
  const validActions = ['resolve', 'suspend_user', 'warn_user', 'dismiss'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be one of: resolve, suspend_user, warn_user, dismiss' });
  }

  const report = await Report.findById(req.params.id).populate('post');
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  if (report.status === 'resolved' || report.status === 'dismissed') {
    return res.status(400).json({ message: `Report already ${report.status}` });
  }

  report.resolutionNote = note || '';
  report.resolvedBy = req.user.id;
  report.resolvedAt = new Date();

  if (action === 'resolve') {
    report.status = 'resolved';
    report.action = 'post_removed';
    if (report.post) {
      await Post.findByIdAndUpdate(report.post._id, { isArchived: true });
    }
  } else if (action === 'suspend_user') {
    report.status = 'resolved';
    report.action = 'user_suspended';
    if (report.post && report.post.user) {
      await User.findByIdAndUpdate(report.post.user._id, { isSuspended: true });
    }
  } else if (action === 'warn_user') {
    report.status = 'reviewed';
    report.action = 'user_warned';
  } else if (action === 'dismiss') {
    report.status = 'dismissed';
    report.action = 'dismissed';
  }

  await report.save();

  res.status(200).json({ message: `Report ${report.status}`, report });
});

const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;
  const search = req.query.search;
  const role = req.query.role;
  const suspended = req.query.suspended;

  const filter = {};
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role && ['user', 'admin', 'super_admin'].includes(role)) {
    filter.role = role;
  }
  if (suspended === 'true') {
    filter.isSuspended = true;
  } else if (suspended === 'false') {
    filter.isSuspended = false;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('username email profilePicture role isSuspended isVerified createdAt followers following')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    data: users.map(u => ({
      id: u._id,
      username: u.username,
      email: u.email,
      profilePicture: u.profilePicture,
      role: u.role,
      isSuspended: u.isSuspended,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      followersCount: u.followers.length,
      followingCount: u.following.length
    })),
    page,
    totalPages: Math.ceil(total / limit),
    totalUsers: total,
    hasMore: page * limit < total
  });
});

const suspendUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (targetUser.role === 'super_admin') {
    return res.status(403).json({ message: 'Cannot suspend a super admin' });
  }
  if (targetUser.role === 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admins can suspend other admins' });
  }
  targetUser.isSuspended = true;
  await targetUser.save();
  res.status(200).json({ message: 'User suspended successfully' });
});

const unsuspendUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  targetUser.isSuspended = false;
  await targetUser.save();
  res.status(200).json({ message: 'User unsuspended successfully' });
});

const setUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Role must be user or admin' });
  }
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (targetUser.role === 'super_admin') {
    return res.status(403).json({ message: 'Cannot modify a super admin' });
  }
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admins can change user roles' });
  }
  targetUser.role = role;
  await targetUser.save();
  res.status(200).json({ message: `User role set to ${role}` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.userId);
  if (!targetUser) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (targetUser.role === 'super_admin') {
    return res.status(403).json({ message: 'Cannot delete a super admin' });
  }
  if (targetUser.role === 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Only super admins can delete other admins' });
  }

  await Promise.all([
    Post.deleteMany({ user: targetUser._id }),
    Comment.deleteMany({ user: targetUser._id }),
    Story.deleteMany({ user: targetUser._id }),
    Report.deleteMany({ reporter: targetUser._id })
  ]);

  await User.updateMany(
    { followers: targetUser._id },
    { $pull: { followers: targetUser._id } }
  );
  await User.updateMany(
    { following: targetUser._id },
    { $pull: { following: targetUser._id } }
  );

  await User.findByIdAndDelete(targetUser._id);

  res.status(200).json({ message: 'User and all associated content deleted successfully' });
});

module.exports = {
  getDashboardStats,
  getReports,
  takeReportAction,
  getUsers,
  suspendUser,
  unsuspendUser,
  setUserRole,
  deleteUser
};