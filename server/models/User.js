// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['applicant', 'recruiter', 'admin'],
    default: 'applicant'
  },
  resume: { type: String },
  skills: [String],
  experience: {
    type: String,
    enum: [
      // For Applicants - Technical/Job Experience
      'Student - Currently pursuing studies',
      '0 years - Fresh Graduate',
      '1-2 years - Junior Level',
      '2-4 years - Mid Level', 
      '4-6 years - Senior Level',
      '6+ years - Expert Level',
      'Career Changer - New to this field',
      
      // For Recruiters - HR/Recruiting Experience
      'New to Recruiting - Less than 1 year',
      '1-3 years - Junior Recruiter',
      '3-5 years - Experienced Recruiter',
      '5-10 years - Senior Recruiter',
      '10+ years - Recruiting Expert',
      'HR Professional - Multiple years in HR',
      'Talent Acquisition Specialist'
    ]
  },
  profileComplete: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
