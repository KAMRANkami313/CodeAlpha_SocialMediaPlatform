const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { createNotification } = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  const newComment = new Comment({
    user: req.user.id,
    post: req.params.postId,
    content
  });
  await newComment.save();
  post.comments.push(newComment._id);
  await post.save();

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
  deleteComment,
  likeUnlikeComment,
  updateComment
};