const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getAdminDashboard = async (req, res) => {
  try {
    const users = await User.find().select('name email role');
    const jobs = await Job.find().select('title recruiterId');
    const applications = await Application.find();

    res.json({
      msg: 'Welcome to the Admin Dashboard!',
      stats: {
        totalUsers: users.length,
        totalJobs: jobs.length,
        totalApplications: applications.length,
      },
      users,
      jobs,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
