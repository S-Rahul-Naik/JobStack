// Usage: node seed-demo-data.js
// Make sure MongoDB is running and you have mongoose installed (npm install mongoose)

const mongoose = require('mongoose');
const Job = require('./models/Job');
const Application = require('./models/Application');

// Use string, not ObjectId constructor, for recruiterId
const recruiterId = '68360ccbfb68852e6aff8a78'; // usha@ gmail.com recruiter

const applicantId = new mongoose.Types.ObjectId(); // random applicant for demo

// Helper to safely create ObjectId
function safeObjectId(id) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch (e) {
    console.error('Invalid ObjectId:', id);
    process.exit(1);
  }
}

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/jobstack');

  // Remove old demo jobs/applications for this recruiter
  await Job.deleteMany({ recruiterId: safeObjectId(recruiterId) });
  await Application.deleteMany({});

  // Create jobs for the last 6 months
  const now = new Date();
  const jobs = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 5);
    jobs.push({
      title: `Demo Job ${i + 1}`,
      description: `This is a demo job for month ${i + 1}`,
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'].slice(0, 2 + (i % 3)),
      recruiterId: safeObjectId(recruiterId),
      applicationDeadline: new Date(date.getFullYear(), date.getMonth(), 28),
      companyName: 'DemoCorp',
      companyLogo: '',
      location: 'Remote',
      salary: `$${50000 + i * 5000}/year`,
      jobType: i % 2 === 0 ? 'Full-time' : 'Part-time',
      country: 'India',
      createdAt: date,
      updatedAt: date
    });
  }
  const createdJobs = await Job.insertMany(jobs);

  // Create applications for each job, spread over the months
  const applications = [];
  createdJobs.forEach((job, idx) => {
    // 2-4 applicants per job
    for (let j = 0; j < 2 + (idx % 3); j++) {
      const appDate = new Date(job.createdAt);
      appDate.setDate(appDate.getDate() + j * 2);
      applications.push({
        jobId: job._id,
        applicantId,
        resumePath: '',
        matchScore: 60 + (j * 10),
        status: j === 0 ? 'applied' : (j % 2 === 0 ? 'shortlisted' : 'rejected'),
        createdAt: appDate,
        updatedAt: appDate
      });
    }
  });
  await Application.insertMany(applications);

  console.log('Demo jobs and applications seeded for recruiter:', recruiterId.toString());
  await mongoose.disconnect();
}

seed();
