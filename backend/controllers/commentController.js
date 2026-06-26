const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createNotification } = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const addComment = asyncHandler(async (req, res) => {
  const { content, parentCommentId } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }
  }

  const newComment = new Comment({
    user: req.user.id,
    post: req.params.postId,
    content,
    parentComment: parentCommentId || null
  });
  await newComment.save();

  if (!parentCommentId) {
    post.comments.push(newComment._id);
    await post.save();
  }

  if (post.user.toString() !== req.user.id) {
    await createNotification({
      sender: req.user.id,
      receiver: post.user,
      type: 'comment',
      post: post._id
    });
  }

  const populatedComment = await Comment.findById(newComment._id).populate('user', 'username profilePicture isVerified');
  res.status(201).json(populatedComment);
});

const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const replies = await Comment.find({ parentComment: commentId })
    .populate('user', 'username profilePicture isVerified')
    .sort({ createdAt: 1 });
  res.status(200).json(replies);
});

const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Unauthorized action' });
  }

  await Comment.deleteMany({ parentComment: commentId });
  await Comment.findByIdAndDelete(commentId);

  post.comments = post.comments.filter(id => id.toString() !== commentId);
  await post.save();
  res.status(200).json({ message: 'Comment deleted successfully' });
});

const likeUnlikeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (comment.likes.includes(req.user.id)) {
    comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
  } else {
    comment.likes.push(req.user.id);
  }
  await comment.save();
  res.status(200).json(comment);
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (comment.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Unauthorized action' });
  }
  comment.content = content;
  await comment.save();
  res.status(200).json(comment);
});

module.exports = {
  addComment,
  getReplies,
  deleteComment,
  likeUnlikeComment,
  updateComment
};