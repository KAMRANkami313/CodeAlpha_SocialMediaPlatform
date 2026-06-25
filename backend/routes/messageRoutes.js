const express = require('express');
const router = express.Router();
const { sendMessage, getConversation, getConversationsList, deleteMessage, getUnreadCount } = require('../controllers/messageController');
const auth = require('../middlewares/auth');

router.get('/conversations', auth, getConversationsList);
router.get('/unread-count', auth, getUnreadCount);
router.get('/:otherUserId', auth, getConversation);
router.post('/:receiverId', auth, sendMessage);
router.delete('/:messageId', auth, deleteMessage);

module.exports = router;