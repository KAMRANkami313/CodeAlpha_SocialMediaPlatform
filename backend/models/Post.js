const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  caption: {
    type: String,
    maxlength: 500
  },
  image: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  views: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isArchived: {
    type: Boolean,
    default: false
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

postSchema.index({ user: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ caption: 'text' });

module.exports = mongoose.model('Post', postSchema);