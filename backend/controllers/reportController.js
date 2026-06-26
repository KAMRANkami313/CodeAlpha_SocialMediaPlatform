const Report = require('../models/Report');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');

const createReport = asyncHandler(async (req, res) => {
  const { postId, reason, description } = req.body;

  if (!postId || !reason) {
    return res.status(400).json({ message: 'Post ID and reason are required' });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (post.user.toString() === req.user.id) {
    return res.status(400).json({ message: 'You cannot report your own post' });
  }

  const existingReport = await Report.findOne({ reporter: req.user.id, post: postId });
  if (existingReport) {
    return res.status(400).json({ message: 'You have already reported this post' });
  }

  const report = await Report.create({
    reporter: req.user.id,
    post: postId,
    reason,
    description: description || ''
  });

  res.status(201).json({ message: 'Report submitted successfully', report });
});

const getReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let filter = {};
  if (status) {
    filter.status = status;
  }

  const reports = await Report.find(filter)
    .populate('reporter', 'username profilePicture isVerified')
    .populate({
      path: 'post',
      populate: {
        path: 'user',
        select: 'username profilePicture isVerified'
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json(reports);
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'reviewed', 'resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  res.status(200).json({ message: 'Report status updated', report });
});

module.exports = {
  createReport,
  getReports,
  updateReportStatus
};