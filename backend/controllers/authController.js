const User = require('../models/User');
const TrustedDevice = require('../models/TrustedDevice');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const otplib = require('otplib');
const { sendVerificationEmail } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');

const TRUSTED_DEVICE_DAYS = 30;

const parseUserAgent = (ua) => {
  if (!ua) return 'Unknown Device';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/')) browser = 'Safari';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';
  return `${browser} on ${os}`;
};

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email or username already exists' });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: Date.now() + 86400000
  });
  await newUser.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

  try {
    await sendVerificationEmail(newUser.email, verificationUrl);
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
  }

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({
    token,
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isEmailVerified: newUser.isEmailVerified
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  if (user.isSuspended) {
    return res.status(403).json({ message: 'Your account has been suspended. Please contact support if you believe this is an error.' });
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    const trustedCookie = req.cookies?.trustedDevice;
    if (trustedCookie) {
      const deviceHash = crypto.createHash('sha256').update(trustedCookie).digest('hex');
      const trustedDevice = await TrustedDevice.findOne({
        user: user._id,
        deviceToken: deviceHash,
        expiresAt: { $gt: new Date() }
      });
      if (trustedDevice) {
        trustedDevice.lastUsedAt = new Date();
        await trustedDevice.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            isVerified: user.isVerified,
            isEmailVerified: user.isEmailVerified,
            role: user.role
          },
          trustedDevice: true
        });
      }
    }

    const tempToken = jwt.sign(
      { id: user._id, twoFactorPending: true },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    return res.status(200).json({
      requiresTwoFactor: true,
      tempToken,
      message: 'Two-factor authentication required'
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      role: user.role
    }
  });
});

const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { tempToken, code, useBackupCode, rememberDevice } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Two-factor session expired. Please log in again.' });
  }

  if (!decoded.twoFactorPending) {
    return res.status(400).json({ message: 'Invalid two-factor session' });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    return res.status(400).json({ message: 'Two-factor authentication is not enabled' });
  }

  if (useBackupCode) {
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    const index = user.twoFactorBackupCodes.indexOf(codeHash);
    if (index === -1) {
      return res.status(400).json({ message: 'Invalid or already used backup code' });
    }
    user.twoFactorBackupCodes.splice(index, 1);
    await user.save();
  } else {
    try {
      const isValid = otplib.verify({
        token: code.trim(),
        secret: user.twoFactorSecret
      });
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
  }

  if (rememberDevice) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const deviceHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const deviceName = parseUserAgent(req.headers['user-agent']);
    const expiresAt = new Date(Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000);

    await TrustedDevice.create({
      user: user._id,
      deviceToken: deviceHash,
      deviceName,
      userAgent: req.headers['user-agent'] || '',
      expiresAt
    });

    res.cookie('trustedDevice', rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000,
      path: '/'
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      isEmailVerified: user.isEmailVerified,
      role: user.role
    }
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  res.status(200).json({ message: 'Password updated successfully' });
});

const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.isEmailVerified) {
    return res.status(400).json({ message: 'Email is already verified' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = Date.now() + 86400000;
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

  try {
    await sendVerificationEmail(user.email, verificationUrl);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send verification email' });
  }

  res.status(200).json({ message: 'Verification email sent' });
});

module.exports = {
  register,
  login,
  verifyTwoFactor,
  changePassword,
  resendVerification
};