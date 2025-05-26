// Get applications for logged-in user
const Application = require('../models/Application');
const Job = require('../models/Job');

exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicantId: req.user.id })
      .populate('jobId', 'title description');

    res.json(apps);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
