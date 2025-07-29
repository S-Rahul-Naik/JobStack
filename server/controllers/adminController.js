const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const mongoose = require('mongoose');

// Admin Dashboard with detailed analytics
exports.getAdminDashboard = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // User role breakdown
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Job statistics
    const activeJobs = await Job.countDocuments({
      applicationDeadline: { $gte: new Date() }
    });
    
    const expiredJobs = await Job.countDocuments({
      applicationDeadline: { $lt: new Date() }
    });

    // Report statistics
    const totalReports = await Conversation.countDocuments({
      status: { $in: ['reported', 'under_review'] }
    });

    // Application status breakdown
    const applicationStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Monthly job postings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyJobs = await Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top recruiters by job count
    const topRecruiters = await Job.aggregate([
      {
        $group: {
          _id: '$recruiterId',
          jobCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'recruiter'
        }
      },
      { $unwind: '$recruiter' },
      {
        $project: {
          name: '$recruiter.name',
          email: '$recruiter.email',
          jobCount: 1
        }
      },
      { $sort: { jobCount: -1 } },
      { $limit: 5 }
    ]);

    // Recent activities
    const recentJobs = await Job.find()
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title companyName createdAt recruiterId');

    const recentApplications = await Application.find()
      .populate('applicantId', 'name email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('status createdAt applicantId jobId');

    res.json({
      msg: 'Welcome to the Admin Dashboard!',
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        expiredJobs,
        totalReports,
        recentUsers
      },
      analytics: {
        userRoles: userRoles.reduce((acc, role) => {
          acc[role._id] = role.count;
          return acc;
        }, {}),
        applicationStats: applicationStats.reduce((acc, status) => {
          acc[status._id || 'pending'] = status.count;
          return acc;
        }, {}),
        monthlyJobs,
        topRecruiters
      },
      recentActivities: {
        recentJobs,
        recentApplications
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deletion of the current admin
    if (userId === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Also delete related applications if user was an applicant
    if (user.role === 'applicant') {
      await Application.deleteMany({ applicantId: userId });
    }

    // Delete jobs if user was a recruiter
    if (user.role === 'recruiter') {
      await Job.deleteMany({ recruiterId: userId });
    }

    res.json({ msg: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all jobs with details
exports.getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = {};
    if (status === 'active') {
      query.applicationDeadline = { $gte: new Date() };
    } else if (status === 'expired') {
      query.applicationDeadline = { $lt: new Date() };
    }

    const jobs = await Job.find(query)
      .populate('recruiterId', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    // Add application count for each job
    const jobsWithStats = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job.toObject(),
          applicationCount
        };
      })
    );

    res.json({
      jobs: jobsWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Also delete related applications
    await Application.deleteMany({ jobId });

    res.json({ msg: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// System statistics
exports.getSystemStats = async (req, res) => {
  try {
    // Database size and collection stats
    const dbStats = await mongoose.connection.db.stats();
    
    // Get collection sizes
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionStats = {};
    
    for (const collection of collections) {
      const stats = await mongoose.connection.db.collection(collection.name).stats();
      collectionStats[collection.name] = {
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize
      };
    }

    res.json({
      database: {
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        collections: dbStats.collections,
        objects: dbStats.objects
      },
      collections: collectionStats
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Export users to Excel
exports.exportUsersExcel = async (req, res) => {
  try {
    const ExcelJS = require('exceljs');
    const { role } = req.query;
    
    // Build query based on role filter
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    // Get users without password
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheetName = role ? `${role.charAt(0).toUpperCase() + role.slice(1)}s` : 'All Users';
    const worksheet = workbook.addWorksheet(worksheetName);

    // Define columns
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Role', key: 'role', width: 15 },
      { header: 'Skills', key: 'skills', width: 40 },
      { header: 'Experience', key: 'experience', width: 30 },
      { header: 'Registration Date', key: 'createdAt', width: 20 },
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Add data rows
    users.forEach(user => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        skills: user.skills && user.skills.length > 0 ? user.skills.join(', ') : 'No skills listed',
        experience: user.experience && user.experience.trim() ? user.experience : 'Profile incomplete - User needs to declare experience',
        createdAt: user.createdAt ? 
          new Date(user.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : 
          'Registration date unavailable'
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = Math.max(column.width, 15);
    });

    // Set response headers
    const filename = role && role !== 'all' ? `${role}s_export.xlsx` : 'all_users_export.xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (err) {
    console.error('Excel export error:', err);
    res.status(500).json({ msg: 'Failed to export Excel file: ' + err.message });
  }
};

// Get reported conversations for admin review
exports.getReportedConversations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reportedConversations = await Conversation.find({ 
      status: { $in: ['reported', 'under_review'] }
    })
      .populate('applicantId', 'name email')
      .populate('recruiterId', 'name email') 
      .populate('jobId', 'title companyName')
      .populate('reportedBy', 'name email role')
      .sort({ 'reportDetails.reportedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Conversation.countDocuments({ 
      status: { $in: ['reported', 'under_review'] }
    });

    res.json({
      conversations: reportedConversations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get messages from a reported conversation
exports.getReportedMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('applicantId', 'name email')
      .populate('recruiterId', 'name email')
      .populate('jobId', 'title companyName')
      .populate('reportedBy', 'name email role');

    if (!conversation || conversation.status !== 'reported') {
      return res.status(404).json({ msg: 'Reported conversation not found' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    res.json({ conversation, messages });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Admin action on reported conversation
exports.resolveReport = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { action, resolution, adminNotes } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // Update conversation status based on admin action
    if (action === 'dismiss') {
      conversation.status = 'active';
    } else if (action === 'warn_recruiter') {
      conversation.status = 'under_review';
      // Here you could add warning logic for the recruiter
    } else if (action === 'suspend_recruiter') {
      conversation.status = 'closed';
      // Here you could add suspension logic for the recruiter
    } else if (action === 'close_conversation') {
      conversation.status = 'closed';
    }

    // Update report details
    conversation.reportDetails.resolution = resolution;
    conversation.reportDetails.adminNotes = adminNotes;
    conversation.reportDetails.resolvedAt = new Date();
    conversation.reportDetails.resolvedBy = req.user.id;

    await conversation.save();

    res.json({ 
      msg: 'Report resolved successfully',
      action: action,
      conversation 
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
