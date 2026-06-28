const User = require('../models/User');
const TrustedDevice = require('../models/TrustedDevice');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const otplib = require('otplib');
const QRCode = require('qrcode');
const asyncHandler = require('../utils/asyncHandler');

const APP_NAME = process.env.TWO_FACTOR_APP_NAME || 'SocialApp';

const setup = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.twoFactorEnabled) {
    return res.status(400).json({ message: 'Two-factor authentication is already enabled' });
  }

  const secret = otplib.generateSecret();
  const otpauth = `otpauth://totp/${encodeURIComponent(APP_NAME)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(APP_NAME)}`;

  user.twoFactorSecret = secret;
  await user.save();

  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  res.status(200).json({
    secret,
    qrCode: qrCodeDataUrl,
    message: 'Scan this QR code with your authenticator app, then verify with a code below.'
  });
});

const verify = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.twoFactorEnabled) {
    return res.status(400).json({ message: 'Two-factor authentication is already enabled' });
  }
  if (!user.twoFactorSecret) {
    return res.status(400).json({ message: 'Please start 2FA setup first' });
  }

  try {
    const isValid = otplib.verify({
      token: code.trim(),
      secret: user.twoFactorSecret
    });
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
  }

  const backupCodes = [];
  for (let i = 0; i < 8; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    backupCodes.push(raw);
  }

  const hashedBackupCodes = backupCodes.map((code) =>
    crypto.createHash('sha256').update(code).digest('hex')
  );

  user.twoFactorEnabled = true;
  user.twoFactorBackupCodes = hashedBackupCodes;
  await user.save();

  res.status(200).json({
    message: 'Two-factor authentication enabled successfully',
    backupCodes,
    twoFactorEnabled: true
  });
});

const disable = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!user.twoFactorEnabled) {
    return res.status(400).json({ message: 'Two-factor authentication is not enabled' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Password is incorrect' });
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.twoFactorBackupCodes = [];
  await user.save();

  await TrustedDevice.deleteMany({ user: user._id });

  res.clearCookie('trustedDevice', { path: '/' });

  res.status(200).json({
    message: 'Two-factor authentication disabled successfully',
    twoFactorEnabled: false
  });
});

const getStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('twoFactorEnabled');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ twoFactorEnabled: user.twoFactorEnabled });
});

const getTrustedDevices = asyncHandler(async (req, res) => {
  const devices = await TrustedDevice.find({
    user: req.user.id,
    expiresAt: { $gt: new Date() }
  })
    .select('deviceName createdAt lastUsedAt expiresAt')
    .sort({ lastUsedAt: -1 });

  res.status(200).json(devices);
});

const revokeTrustedDevice = asyncHandler(async (req, res) => {
  const device = await TrustedDevice.findOne({
    _id: req.params.id,
    user: req.user.id
  });
  if (!device) {
    return res.status(404).json({ message: 'Device not found' });
  }

  const deviceHash = device.deviceToken;
  await TrustedDevice.findByIdAndDelete(req.params.id);

  const trustedCookie = req.cookies?.trustedDevice;
  if (trustedCookie) {
    const cookieHash = crypto.createHash('sha256').update(trustedCookie).digest('hex');
    if (cookieHash === deviceHash) {
      res.clearCookie('trustedDevice', { path: '/' });
    }
  }

  res.status(200).json({ message: 'Device revoked successfully' });
});

const revokeAllTrustedDevices = asyncHandler(async (req, res) => {
  await TrustedDevice.deleteMany({ user: req.user.id });
  res.clearCookie('trustedDevice', { path: '/' });
  res.status(200).json({ message: 'All devices revoked successfully' });
});

module.exports = {
  setup,
  verify,
  disable,
  getStatus,
  getTrustedDevices,
  revokeTrustedDevice,
  revokeAllTrustedDevices
};