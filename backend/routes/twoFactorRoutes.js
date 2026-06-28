const express = require('express');
const router = express.Router();
const {
  setup,
  verify,
  disable,
  getStatus,
  getTrustedDevices,
  revokeTrustedDevice,
  revokeAllTrustedDevices
} = require('../controllers/twoFactorController');
const auth = require('../middlewares/auth');

router.get('/status', auth, getStatus);
router.post('/setup', auth, setup);
router.post('/verify', auth, verify);
router.post('/disable', auth, disable);
router.get('/devices', auth, getTrustedDevices);
router.delete('/devices/:id', auth, revokeTrustedDevice);
router.delete('/devices', auth, revokeAllTrustedDevices);

module.exports = router;