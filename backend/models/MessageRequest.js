const mongoose = require('mongoose');

const messageRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

messageRequestSchema.index({ sender: 1, receiver: 1, status: 1 });

module.exports = mongoose.model('MessageRequest', messageRequestSchema);