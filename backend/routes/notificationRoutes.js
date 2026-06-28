const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsAsRead, markSingleAsRead } = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

router.get('/', auth, getNotifications);
router.put('/read', auth, markNotificationsAsRead);
router.put('/:id/read', auth, markSingleAsRead);

module.exports = router;