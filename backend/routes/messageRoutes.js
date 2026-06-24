const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversationsList } = require('../controllers/messageController');
const auth = require('../middlewares/auth');

router.get('/conversations', auth, getConversationsList);
router.get('/:otherUserId', auth, getConversation);
router.post('/:receiverId', auth, sendMessage);

module.exports = router;