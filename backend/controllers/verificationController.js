const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Email verification token is invalid or has expired' });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully' });
});

module.exports = { verifyEmail };