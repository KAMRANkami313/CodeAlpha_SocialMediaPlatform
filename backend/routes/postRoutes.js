const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getUserPosts,
  deletePost,
  likeUnlikePost,
  getPostById
} = require('../controllers/postController');
const { addComment, deleteComment } = require('../controllers/commentController');
const auth = require('../middlewares/auth');

router.post('/', auth, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/user/:userId', getUserPosts);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likeUnlikePost);
router.post('/:postId/comment', auth, addComment);
router.delete('/:postId/comment/:commentId', auth, deleteComment);

module.exports = router;