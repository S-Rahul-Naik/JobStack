// server/models/ArchivedApplication.js
const mongoose = require('mongoose');

const archivedApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resumePath: String,
  matchScore: Number,
  status: String,
  removedAt: { type: Date, default: Date.now },
  originalCreatedAt: Date,
  originalUpdatedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('ArchivedApplication', archivedApplicationSchema);
