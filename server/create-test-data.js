// Create test users for communication demo
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

async function createTestData() {
  await mongoose.connect('mongodb://localhost:27017/jobstack');
  
  console.log('Creating test data for communication system demo...\n');

  // Create test recruiter
  const testRecruiter = new User({
    name: 'Test Recruiter',
    email: 'testrecruiter@demo.com',
    password: 'demo123',
    role: 'recruiter'
  });
  await testRecruiter.save();
  console.log('✅ Test recruiter created');

  // Create test applicant
  const testApplicant = new User({
    name: 'Test Applicant',
    email: 'testapplicant@demo.com',
    password: 'demo123',
    role: 'applicant'
  });
  await testApplicant.save();
  console.log('✅ Test applicant created');

  // Create test job
  const testJob = new Job({
    title: 'Software Developer',
    description: 'Exciting opportunity for a software developer',
    requirements: 'JavaScript, React, Node.js',
    salary: '$60,000 - $80,000',
    location: 'Remote',
    companyName: 'Demo Tech Corp',
    contactEmail: 'hr@demo.com',
    recruiterId: testRecruiter._id,
    requiredSkills: ['JavaScript', 'React', 'Node.js']
  });
  await testJob.save();
  console.log('✅ Test job created');

  // Create test application
  const testApplication = new Application({
    applicantId: testApplicant._id,
    jobId: testJob._id,
    status: 'applied',
    resumePath: 'uploads/demo-resume.pdf'
  });
  await testApplication.save();
  console.log('✅ Test application created');

  console.log('\n🎉 Test data ready!');
  console.log('📧 Recruiter: testrecruiter@demo.com / demo123');
  console.log('📧 Applicant: testapplicant@demo.com / demo123');
  
  await mongoose.disconnect();
}

createTestData().catch(console.error);
