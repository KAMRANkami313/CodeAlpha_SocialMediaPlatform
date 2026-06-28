const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ip: {
    type: String,
    default: ''
  },
  deviceName: {
    type: String,
    default: ''
  },
  browser: {
    type: String,
    default: ''
  },
  os: {
    type: String,
    default: ''
  },
  loginMethod: {
    type: String,
    enum: ['password', 'two_factor', 'trusted_device', 'register'],
    default: 'password'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

userActivitySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);