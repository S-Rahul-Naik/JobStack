// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['applicant', 'recruiter', 'system', 'ai'],
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'video', 'image', 'system'],
    required: true
  },
  content: {
    text: String,
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // AI Analysis Results
  aiAnalysis: {
    fraudScore: { type: Number, default: 0, min: 0, max: 100 },
    sentimentScore: { type: Number, default: 0, min: -1, max: 1 },
    riskFlags: [String],
    inappropriate: { type: Boolean, default: false },
    suspiciousKeywords: [String],
    analysisTimestamp: Date
  },
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'flagged', 'hidden'],
    default: 'sent'
  },
  editedAt: Date,
  deletedAt: Date
}, { timestamps: true });

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ 'aiAnalysis.fraudScore': 1 });

module.exports = mongoose.model('Message', messageSchema);
