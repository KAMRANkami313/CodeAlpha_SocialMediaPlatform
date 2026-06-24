const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationsAsRead } = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

router.get('/', auth, getNotifications);
router.put('/read', auth, markNotificationsAsRead);

module.exports = router;