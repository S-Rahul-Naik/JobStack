const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const ArchivedApplication = require('../models/ArchivedApplication');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const parseResume = require('../utils/resumeParser');
const { extractSkills, getMissingSkills } = require('../utils/resumeMatcher');

// Helper to check if applications are closed and for how long
function getApplicationClosedInfo(job) {
  if (!job.applicationDeadline) return null;
  const now = new Date();
  const deadline = new Date(job.applicationDeadline);
  if (now > deadline) {
    const diffMs = now - deadline;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return { closed: true, hours: diffHours, since: diffMs };
  }
  return { closed: false };
}

// 🔹 Get applicants for the recruiter's jobs (with filtering/sorting)
exports.getApplicantsForRecruiter = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id });
    const jobIds = jobs.map(job => job._id);

    // Filtering
    const filter = { jobId: { $in: jobIds } };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Sorting
    let sort = {};
    if (req.query.sortBy === 'matchScore') {
      sort.matchScore = req.query.order === 'desc' ? -1 : 1;
    } else if (req.query.sortBy === 'date') {
      sort.createdAt = req.query.order === 'desc' ? -1 : 1;
    }

    const applications = await Application.find(filter)
      .populate('applicantId', 'name email skills')
      .populate('jobId', 'title description applicationDeadline requiredSkills')
      .sort(sort);

    // Attach closed info and missing skills to each application
    for (const app of applications) {
      if (app.jobId && app.jobId.applicationDeadline) {
        app._doc.applicationClosedInfo = getApplicationClosedInfo(app.jobId);
      }
      // Extract missing skills if resume and requiredSkills exist
      if (app.resumePath && app.jobId && Array.isArray(app.jobId.requiredSkills) && app.jobId.requiredSkills.length > 0) {
        try {
          const resumeText = await parseResume(app.resumePath);
          const applicantSkills = extractSkills(resumeText);
          const missingSkills = getMissingSkills(applicantSkills, app.jobId.requiredSkills.map(s => s.toLowerCase()));
          app._doc.missingSkills = missingSkills;
        } catch (e) {
          app._doc.missingSkills = null;
        }
      } else {
        app._doc.missingSkills = null;
      }
    }
    res.json(applications);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching applicants: ' + err.message });
  }
};

// 🔹 Create a new job
exports.createJob = async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    applicationDeadline,
    companyName,
    companyLogo,
    location,
    salary,
    jobType,
    country
  } = req.body;
  try {
    const job = new Job({
      title,
      description,
      requiredSkills,
      recruiterId: req.user.id,
      applicationDeadline, // Save deadline if provided
      companyName,
      companyLogo,
      location,
      salary,
      jobType,
      country
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ msg: 'Error creating job: ' + err.message });
  }
};

// 🔹 Fetch all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('recruiterId', 'name email');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching jobs: ' + err.message });
  }
};

// 🔹 Apply to a job
exports.applyToJob = async (req, res) => {
  const jobId = req.params.id;
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ msg: 'Job not found' });
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({ msg: 'Applications for this job are closed.' });
    }

    // Prevent duplicate application (active or archived)
    const existingApp = await Application.findOne({ jobId, applicantId: req.user.id });
    if (existingApp) return res.status(400).json({ msg: 'Already applied to this job' });
    const ArchivedApplication = require('../models/ArchivedApplication');
    const archivedApp = await ArchivedApplication.findOne({ jobId, applicantId: req.user.id });
    if (archivedApp) return res.status(400).json({ msg: 'You have already applied to this job (even if removed).' });

    const application = new Application({
      jobId,
      applicantId: req.user.id,
      status: 'applied',
      matchScore: 0, // initial score
    });

    await application.save();
    res.status(201).json({ msg: 'Applied successfully', application });
  } catch (err) {
    res.status(500).json({ msg: 'Error applying to job: ' + err.message });
  }
};

// 🔹 Update applicant status (shortlist/reject)
exports.updateApplicantStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // 'shortlisted' or 'rejected'
  if (!['shortlisted', 'rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }
  try {
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    application.status = status;
    await application.save();
    res.json({ msg: 'Status updated', application });
  } catch (err) {
    res.status(500).json({ msg: 'Error updating status: ' + err.message });
  }
};

// 🔹 Serve applicant resume file for recruiter
exports.getApplicantResume = async (req, res) => {
  const { applicationId } = req.params;
  try {
    const application = await Application.findById(applicationId);
    if (!application || !application.resumePath) {
      return res.status(404).json({ msg: 'Resume not found' });
    }
    const filePath = path.resolve(__dirname, '../', application.resumePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ msg: 'Resume file missing on server' });
    }
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching resume: ' + err.message });
  }
};

// 🔹 Export applicants to Excel (include archived)
exports.exportApplicantsToExcel = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id });
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('applicantId', 'name email')
      .populate('jobId', 'title');
    const archivedApplications = await ArchivedApplication.find({ jobId: { $in: jobIds } })
      .populate('applicantId', 'name email')
      .populate('jobId', 'title');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Applicants');
    worksheet.columns = [
      { header: 'Job Title', key: 'jobTitle', width: 30 },
      { header: 'Applicant Name', key: 'name', width: 25 },
      { header: 'Applicant Email', key: 'email', width: 30 },
      { header: 'Match Score', key: 'matchScore', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Removed', key: 'removed', width: 15 },
    ];
    applications.forEach(app => {
      worksheet.addRow({
        jobTitle: app.jobId.title,
        name: app.applicantId.name,
        email: app.applicantId.email,
        matchScore: app.matchScore,
        status: app.status,
        removed: ''
      });
    });
    archivedApplications.forEach(app => {
      worksheet.addRow({
        jobTitle: app.jobId.title,
        name: app.applicantId.name,
        email: app.applicantId.email,
        matchScore: app.matchScore,
        status: app.status,
        removed: 'Yes'
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=applicants.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ msg: 'Error exporting applicants: ' + err.message });
  }
};

// 🔹 Edit a job (recruiter only)
exports.editJob = async (req, res) => {
  const { id } = req.params;
  const { title, description, requiredSkills } = req.body;
  try {
    const job = await Job.findOne({ _id: id, recruiterId: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Job not found or unauthorized' });
    if (title) job.title = title;
    if (description) job.description = description;
    if (requiredSkills) job.requiredSkills = requiredSkills;
    await job.save();
    res.json({ msg: 'Job updated', job });
  } catch (err) {
    res.status(500).json({ msg: 'Error updating job: ' + err.message });
  }
};

// 🔹 Delete a job (recruiter only)
exports.deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findOneAndDelete({ _id: id, recruiterId: req.user.id });
    if (!job) return res.status(404).json({ msg: 'Job not found or unauthorized' });
    // Optionally, delete related applications
    await Application.deleteMany({ jobId: id });
    res.json({ msg: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting job: ' + err.message });
  }
};

// 🔹 Delete (archive) an applicant (application)
exports.deleteApplicant = async (req, res) => {
  const { applicationId } = req.params;
  try {
    // Find the application
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ msg: 'Application not found' });

    // Archive the application
    await ArchivedApplication.create({
      jobId: application.jobId,
      applicantId: application.applicantId,
      resumePath: application.resumePath,
      matchScore: application.matchScore,
      status: application.status,
      originalCreatedAt: application.createdAt,
      originalUpdatedAt: application.updatedAt
    });

    // Remove from Application collection
    await Application.findByIdAndDelete(applicationId);
    res.json({ msg: 'Applicant removed and archived.' });
  } catch (err) {
    res.status(500).json({ msg: 'Error removing applicant: ' + err.message });
  }
};

// 🔹 Get jobs posted by the logged-in recruiter
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching your jobs: ' + err.message });
  }
};
