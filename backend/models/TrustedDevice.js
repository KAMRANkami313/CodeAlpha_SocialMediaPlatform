const mongoose = require('mongoose');

const trustedDeviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceToken: {
    type: String,
    required: true,
    unique: true
  },
  deviceName: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  }
});

trustedDeviceSchema.index({ user: 1, deviceToken: 1 });

module.exports = mongoose.model('TrustedDevice', trustedDeviceSchema);