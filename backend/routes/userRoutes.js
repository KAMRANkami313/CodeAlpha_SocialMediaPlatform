const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  saveUnsavePost,
  searchUsers,
  getSuggestedUsers
} = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/search', searchUsers);
router.get('/suggested', auth, getSuggestedUsers);
router.get('/profile/:id', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/follow/:id', auth, followUser);
router.post('/unfollow/:id', auth, unfollowUser);
router.post('/save/:postId', auth, saveUnsavePost);

module.exports = router;