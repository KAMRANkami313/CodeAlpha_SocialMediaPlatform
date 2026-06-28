const express = require('express');
const router = express.Router();
const { verifyTwoFactor } = require('../controllers/authController');

router.post('/verify-2fa', verifyTwoFactor);

module.exports = router;