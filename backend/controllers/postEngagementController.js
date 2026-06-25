const Post = require('../models/Post');
const { createNotification } = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');

const likeUnlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  if (post.likes.includes(req.user.id)) {
    post.likes = post.likes.filter(id => id.toString() !== req.user.id);
  } else {
    post.likes.push(req.user.id);
    if (post.user.toString() !== req.user.id) {
      await createNotification({
        sender: req.user.id,
        receiver: post.user,
        type: 'like',
        post: post._id
      });
    }
  }
  await post.save();
  res.status(200).json(post);
});

const trackImpression = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      message: 'Post not found'
    });
  }

  const userId = req.user.id;

  const alreadyViewed = post.views.some(
    id => id.toString() === userId.toString()
  );

  if (!alreadyViewed) {
    post.views.push(userId);
    await post.save();
  }

  res.status(200).json({
    views: post.views.length
  });
});

module.exports = {
  likeUnlikePost,
  trackImpression
};