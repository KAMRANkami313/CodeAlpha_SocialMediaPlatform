const Post = require('../models/Post');
const { findPostByIdPopulated, findPostsPopulated } = require('../utils/postHelpers');
const asyncHandler = require('../utils/asyncHandler');

const PAGE_SIZE = 10;

const createPost = asyncHandler(async (req, res) => {
  const { caption, image } = req.body;
  const newPost = new Post({
    user: req.user.id,
    caption,
    image
  });
  await newPost.save();
  const populatedPost = await Post.findById(newPost._id).populate('user', 'username profilePicture isVerified');
  res.status(201).json(populatedPost);
});

const getAllPosts = asyncHandler(async (req, res) => {
  const { tag } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || PAGE_SIZE));
  const skip = (page - 1) * limit;

  let filter = { isArchived: { $ne: true } };
  if (tag) {
    filter = { isArchived: { $ne: true }, caption: { $regex: `#${tag}`, $options: 'i' } };
  }

  const [posts, total] = await Promise.all([
    findPostsPopulated(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(filter)
  ]);

  res.status(200).json({
    data: posts,
    page,
    totalPages: Math.ceil(total / limit),
    totalPosts: total,
    hasMore: page * limit < total
  });
});

const getUserPosts = asyncHandler(async (req, res) => {
  const isOwner = req.user && req.user.id === req.params.userId;
  const filter = { user: req.params.userId };
  if (!isOwner) {
    filter.isArchived = { $ne: true };
  }
  const posts = await findPostsPopulated(filter).sort({ createdAt: -1 });
  res.status(200).json(posts);
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Unauthorized action' });
  }
  await Post.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Post deleted successfully' });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await findPostByIdPopulated(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.status(200).json(post);
});

const updatePost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Unauthorized action' });
  }
  post.caption = caption;
  await post.save();
  const populatedPost = await findPostByIdPopulated(post._id);
  res.status(200).json(populatedPost);
});

const archivePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Unauthorized action' });
  }
  post.isArchived = true;
  await post.save();
  res.status(200).json({ message: 'Post archived successfully', isArchived: true });
});

const unarchivePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Unauthorized action' });
  }
  post.isArchived = false;
  await post.save();
  res.status(200).json({ message: 'Post restored successfully', isArchived: false });
});

const getArchivedPosts = asyncHandler(async (req, res) => {
  const posts = await findPostsPopulated({
    user: req.user.id,
    isArchived: true
  }).sort({ createdAt: -1 });
  res.status(200).json(posts);
});

module.exports = {
  createPost,
  getAllPosts,
  getUserPosts,
  deletePost,
  getPostById,
  updatePost,
  archivePost,
  unarchivePost,
  getArchivedPosts
};