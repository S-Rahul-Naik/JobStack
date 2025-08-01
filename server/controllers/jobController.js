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

    // 🔔 Create notification for relevant candidates
    const { createNotification } = require('./notificationController');
    
    // Find candidates with matching skills (at least 30% skill match)
    const jobSkills = requiredSkills || [];
    if (jobSkills.length > 0) {
      const candidates = await User.find({ 
        role: 'applicant',
        skills: { $in: jobSkills }
      }).select('_id name skills');

      // Notify candidates with good skill match
      const relevantCandidates = candidates.filter(candidate => {
        const candidateSkills = candidate.skills || [];
        const matchCount = jobSkills.filter(skill => 
          candidateSkills.some(cSkill => 
            cSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(cSkill.toLowerCase())
          )
        ).length;
        const matchPercentage = (matchCount / jobSkills.length) * 100;
        return matchPercentage >= 30; // 30% skill match threshold
      });

      // Send notifications to relevant candidates
      const notificationPromises = relevantCandidates.map(candidate =>
        createNotification(candidate._id, {
          title: '🎯 New Matching Job Posted',
          message: `A new ${title} position at ${companyName} matches your skills. Apply now!`,
          type: 'job_match',
          actionUrl: `/jobs/${job._id}`,
          metadata: {
            jobId: job._id,
            companyName,
            location: location || 'Remote',
            salary: salary || 'Competitive'
          }
        })
      );

      await Promise.all(notificationPromises);
      
      console.log(`📧 Notified ${relevantCandidates.length} relevant candidates about new job: ${title}`);
    }

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
    const job = await Job.findById(jobId).populate('recruiterId', 'name email');
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

    // 🔔 Create notifications
    const { createNotification } = require('./notificationController');
    const User = require('../models/User');
    const applicant = await User.findById(req.user.id);

    // Notify applicant of successful application
    await createNotification(req.user.id, {
      title: '✅ Application Submitted',
      message: `Your application for ${job.title} at ${job.companyName} has been submitted successfully.`,
      type: 'application',
      actionUrl: '/my-applications',
      metadata: {
        jobId: job._id,
        companyName: job.companyName
      }
    });

    // Notify recruiter of new application
    if (job.recruiterId) {
      await createNotification(job.recruiterId._id, {
        title: '📋 New Application Received',
        message: `${applicant.name} has applied for ${job.title}. Review their application in your dashboard.`,
        type: 'application',
        actionUrl: '/recruiter',
        metadata: {
          applicantId: req.user.id,
          jobId: job._id,
          applicantName: applicant.name
        }
      });
    }

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
    const application = await Application.findById(applicationId)
      .populate('applicantId', 'name email')
      .populate('jobId', 'title companyName');
      
    if (!application) return res.status(404).json({ msg: 'Application not found' });
    
    const oldStatus = application.status;
    application.status = status;
    await application.save();

    // � Create notification for applicant
    const { createNotification } = require('./notificationController');
    
    if (status === 'shortlisted') {
      await createNotification(application.applicantId._id, {
        title: '🎉 Application Shortlisted!',
        message: `Your application for ${application.jobId.title} at ${application.jobId.companyName} has been shortlisted. Check your messages for next steps.`,
        type: 'application',
        actionUrl: '/my-applications',
        metadata: {
          applicationId: applicationId,
          jobId: application.jobId._id,
          companyName: application.jobId.companyName
        }
      });
    } else if (status === 'rejected') {
      await createNotification(application.applicantId._id, {
        title: 'Application Update',
        message: `Thank you for your interest in ${application.jobId.title} at ${application.jobId.companyName}. We've decided to move forward with other candidates.`,
        type: 'application',
        actionUrl: '/my-applications',
        metadata: {
          applicationId: applicationId,
          jobId: application.jobId._id,
          companyName: application.jobId.companyName
        }
      });
    }

    // �🚀 AUTO-START CONVERSATION when shortlisted
    if (status === 'shortlisted' && oldStatus !== 'shortlisted') {
      try {
        const Conversation = require('../models/Conversation');
        const Message = require('../models/Message');

        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
          applicantId: application.applicantId._id,
          recruiterId: req.user.id,
          jobId: application.jobId._id,
          applicationId: applicationId
        });

        if (!existingConversation) {
          // Create new conversation
          const conversation = new Conversation({
            applicantId: application.applicantId._id,
            recruiterId: req.user.id,
            jobId: application.jobId._id,
            applicationId: applicationId
          });

          await conversation.save();

          // Send system message to start conversation
          const systemMessage = new Message({
            conversationId: conversation._id,
            senderId: req.user.id,
            senderType: 'system',
            messageType: 'system',
            content: {
              text: `🎉 Congratulations! ${application.applicantId.name} has been shortlisted for ${application.jobId.title} at ${application.jobId.companyName}. You can now communicate directly to discuss next steps.`
            },
            aiAnalysis: {
              fraudScore: 0,
              sentimentScore: 1,
              riskFlags: [],
              inappropriate: false,
              suspiciousKeywords: [],
              analysisTimestamp: new Date()
            }
          });

          await systemMessage.save();
          
          console.log(`✅ Auto-started conversation for shortlisted applicant: ${application.applicantId.name}`);
        }
      } catch (convErr) {
        console.error('Error auto-starting conversation:', convErr);
        // Don't fail the status update if conversation creation fails
      }
    }

    res.json({ 
      msg: `Status updated to ${status}`, 
      application,
      conversationStarted: status === 'shortlisted' 
    });
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

// 🔹 Recruiter dashboard stats
exports.getRecruiterStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    // Total jobs posted
    const totalJobs = await Job.countDocuments({ recruiterId });
    // All job IDs for this recruiter
    const jobIds = (await Job.find({ recruiterId }, '_id')).map(j => j._id);
    // Applications for these jobs
    const totalApplicants = await Application.countDocuments({ jobId: { $in: jobIds } });
    const totalShortlisted = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'shortlisted' });
    const totalRejected = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'rejected' });
    const totalApplied = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'applied' });
    res.json({
      totalJobs,
      totalApplicants,
      totalShortlisted,
      totalRejected,
      totalApplied
    });
  } catch (err) {
    console.error('Error in getRecruiterStats:', err); // <-- Add error logging
    res.status(500).json({ msg: 'Error fetching recruiter stats: ' + err.message });
  }
};

// 🔹 Recruiter analytics: jobs and applicants trend over time
exports.getRecruiterTrends = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    // Parse date range from query
    let { from, to } = req.query;
    let fromDate, toDate;
    if (from && to) {
      fromDate = new Date(from + 'T00:00:00.000Z');
      toDate = new Date(to + 'T23:59:59.999Z');
    } else {
      // Default: last 6 months
      const now = new Date();
      toDate = now;
      fromDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    }
    // Jobs posted per month in range
    const jobs = await Job.aggregate([
      { $match: {
          recruiterId: typeof recruiterId === 'string' ? new (require('mongoose').Types.ObjectId)(recruiterId) : recruiterId,
          createdAt: { $gte: fromDate, $lte: toDate }
        }
      },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    // Applicants per month in range
    const jobIds = (await Job.find({ recruiterId }, '_id')).map(j => j._id);
    const applicants = await Application.aggregate([
      { $match: {
          jobId: { $in: jobIds },
          createdAt: { $gte: fromDate, $lte: toDate }
        }
      },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    res.json({ jobs, applicants });
  } catch (err) {
    console.error('Error in getRecruiterTrends:', err); // <-- Add error logging
    res.status(500).json({ msg: 'Error fetching recruiter trends: ' + err.message });
  }
};

// Get real-time applicants count for a job
exports.getApplicantsCount = async (req, res) => {
  try {
    const jobId = req.params.id;
    const count = await Application.countDocuments({ jobId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
