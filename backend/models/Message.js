const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    ref: 'User'
  },
  to: {
    type: String,
    required: true,
    ref: 'User'
  },
  encryptedContent: {
    type: String,
    required: true
  },
  encryptedAESKey: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file'],
    default: 'text'
  }
}, {
  timestamps: true
});

// Index for efficient message retrieval
messageSchema.index({ from: 1, to: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);