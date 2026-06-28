const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getConversationsList,
  deleteMessage,
  getUnreadCount,
  reactToMessage,
  getMessageRequests,
  acceptMessageRequest,
  declineMessageRequest
} = require('../controllers/messageController');
const auth = require('../middlewares/auth');

router.get('/conversations', auth, getConversationsList);
router.get('/unread-count', auth, getUnreadCount);
router.get('/requests', auth, getMessageRequests);
router.post('/requests/:id/accept', auth, acceptMessageRequest);
router.post('/requests/:id/decline', auth, declineMessageRequest);
router.get('/:otherUserId', auth, getConversation);
router.post('/:receiverId', auth, sendMessage);
router.post('/:messageId/react', auth, reactToMessage);
router.delete('/:messageId', auth, deleteMessage);

module.exports = router;