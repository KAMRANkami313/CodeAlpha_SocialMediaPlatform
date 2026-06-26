const express = require('express');
const router = express.Router();
const { blockUser, unblockUser, getBlockedUsers, checkBlockStatus } = require('../controllers/blockController');
const auth = require('../middlewares/auth');

router.post('/block/:id', auth, blockUser);
router.post('/unblock/:id', auth, unblockUser);
router.get('/blocked', auth, getBlockedUsers);
router.get('/status/:id', auth, checkBlockStatus);

module.exports = router;