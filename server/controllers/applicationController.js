// Get applications for logged-in user
const Application = require('../models/Application');
const Job = require('../models/Job');

exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicantId: req.user.id })
      .populate('jobId', 'title description companyName applicantsCount requiredSkills');

    // Attach missingSkills for each application
    for (const app of apps) {
      if (app.resumePath && app.jobId && Array.isArray(app.jobId.requiredSkills) && app.jobId.requiredSkills.length > 0) {
        try {
          const parseResume = require('../utils/resumeParser');
          const { extractSkills, getMissingSkills } = require('../utils/resumeMatcher');
          const resumeText = await parseResume(app.resumePath);
          const applicantSkills = extractSkills(resumeText);
          const missingSkills = getMissingSkills(applicantSkills, app.jobId.requiredSkills.map(s => s.toLowerCase()));
          app._doc.missingSkills = missingSkills;
        } catch (e) {
          app._doc.missingSkills = [];
        }
      } else {
        app._doc.missingSkills = [];
      }
    }

    res.json(apps);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
