const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getUserPosts,
  deletePost,
  likeUnlikePost
} = require('../controllers/postController');
const { addComment } = require('../controllers/commentController');
const auth = require('../middlewares/auth');

router.post('/', auth, createPost);
router.get('/', getAllPosts);
router.get('/user/:userId', getUserPosts);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likeUnlikePost);
router.post('/:postId/comment', auth, addComment);

module.exports = router;