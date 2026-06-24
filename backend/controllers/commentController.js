const Comment = require('../models/Comment');
const Post = require('../models/Post');

const addComment = async (req, res) => {
  try {
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
    const populatedComment = await Comment.findById(newComment._id).populate('user', 'username profilePicture');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  deleteComment
};