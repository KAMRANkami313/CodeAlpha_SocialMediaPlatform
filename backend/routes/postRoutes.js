const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getUserPosts,
  deletePost,
  getPostById,
  updatePost
} = require('../controllers/postController');
const { likeUnlikePost, trackImpression } = require('../controllers/postEngagementController');
const { addComment, getReplies, deleteComment, likeUnlikeComment, updateComment } = require('../controllers/commentController');
const auth = require('../middlewares/auth');
const { validatePost, validateComment } = require('../middlewares/validator');

router.post('/', auth, validatePost, createPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/user/:userId', getUserPosts);
router.delete('/:id', auth, deletePost);
router.post('/:id/like', auth, likeUnlikePost);
router.post('/:postId/comment', auth, validateComment, addComment);
router.get('/:postId/comment/:commentId/replies', auth, getReplies);
router.delete('/:postId/comment/:commentId', auth, deleteComment);
router.post('/:postId/comment/:commentId/like', auth, likeUnlikeComment);
router.put('/:id', auth, updatePost);
router.put('/:postId/comment/:commentId', auth, updateComment);
router.post('/:id/view', auth, trackImpression);

module.exports = router;