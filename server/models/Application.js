const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resumePath: String,
  matchScore: Number,
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected'],
    default: 'applied'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
