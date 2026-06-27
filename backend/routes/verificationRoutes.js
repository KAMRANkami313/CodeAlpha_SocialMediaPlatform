const express = require('express');
const router = express.Router();
const { verifyEmail } = require('../controllers/verificationController');
const { resendVerification } = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.get('/verify/:token', verifyEmail);
router.post('/resend', auth, resendVerification);

module.exports = router;