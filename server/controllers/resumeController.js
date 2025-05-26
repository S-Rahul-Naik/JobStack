// server/controllers/resumeController.js
const parseResume = require('../utils/resumeParser');
const { matchSkills, extractSkills, getMissingSkills } = require('../utils/resumeMatcher');
const Job = require('../models/Job');
const Application = require('../models/Application');
const fs = require('fs');

exports.uploadResumeAndMatch = async (req, res) => {
  const file = req.file;
  const { jobId } = req.body;

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const resumeText = await parseResume(file.path);
    const matchScore = matchSkills(resumeText, job.requiredSkills);
    const applicantSkills = extractSkills(resumeText);
    const missingSkills = getMissingSkills(applicantSkills, job.requiredSkills.map(s => s.toLowerCase()));
    const matchedSkills = job.requiredSkills.filter(skill => applicantSkills.includes(skill.toLowerCase()));

    // ✅ Save application
    await Application.create({
      jobId,
      applicantId: req.user.id,
      resumePath: file.path,
      matchScore,
    });

    res.json({
      msg: 'Resume uploaded and matched',
      matchScore,
      skillsRequired: job.requiredSkills,
      matchedSkills,
      missingSkills,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
