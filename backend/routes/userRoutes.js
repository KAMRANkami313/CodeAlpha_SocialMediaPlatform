const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { getProfile, updateProfile } = require('../controllers/userProfileController');
const { followUser, unfollowUser } = require('../controllers/followController');
const {
  saveUnsavePost,
  searchUsers,
  getSuggestedUsers,
  registerActivityPing
} = require('../controllers/userInteractionController');
const auth = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validateRegister, validateLogin } = require('../middlewares/validator');

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/search', searchUsers);
router.get('/suggested', auth, getSuggestedUsers);
router.get('/profile/:id', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/follow/:id', auth, followUser);
router.post('/unfollow/:id', auth, unfollowUser);
router.post('/save/:postId', auth, saveUnsavePost);
router.put('/ping', auth, registerActivityPing);

module.exports = router;