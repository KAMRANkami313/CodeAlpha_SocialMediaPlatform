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

module.exports = {
  addComment
};