const express = require('express');
const router = express.Router();
const { getActivityLog } = require('../controllers/activityLogController');
const auth = require('../middlewares/auth');

router.get('/', auth, getActivityLog);

module.exports = router;