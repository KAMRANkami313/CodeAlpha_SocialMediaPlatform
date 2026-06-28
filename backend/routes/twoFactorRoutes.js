const express = require('express');
const router = express.Router();
const { setup, verify, disable, getStatus } = require('../controllers/twoFactorController');
const auth = require('../middlewares/auth');

router.get('/status', auth, getStatus);
router.post('/setup', auth, setup);
router.post('/verify', auth, verify);
router.post('/disable', auth, disable);

module.exports = router;