// server/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  requiredSkills: [String],
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  applicationDeadline: { type: Date }, // New field for application closing
  // Added fields for richer job listings
  companyName: { type: String },
  companyLogo: { type: String }, // URL or path to logo image
  location: { type: String },
  salary: { type: String },
  jobType: { type: String }, // e.g., Full-time, Part-time, Freelance
  country: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
