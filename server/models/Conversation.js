// server/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'reported', 'under_review'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  aiRiskScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  aiFlags: [{
    type: { type: String },
    timestamp: { type: Date, default: Date.now },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] }
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportDetails: {
    reason: String,
    evidence: [String], // File paths to evidence
    reportedAt: Date,
    adminNotes: String,
    resolution: String
  }
}, { timestamps: true });

// Update last activity on any message
conversationSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
