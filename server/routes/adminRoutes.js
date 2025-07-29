const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');
const { 
  getAdminDashboard,
  getAllUsers,
  deleteUser,
  getAllJobs,
  deleteJob,
  getSystemStats,
  exportUsersExcel,
  getReportedConversations,
  getReportedMessages,
  resolveReport
} = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', auth, adminOnly, getAdminDashboard);

// User Management
router.get('/users', auth, adminOnly, getAllUsers);
router.get('/users/export', auth, adminOnly, exportUsersExcel);
router.delete('/users/:userId', auth, adminOnly, deleteUser);

// Job Management
router.get('/jobs', auth, adminOnly, getAllJobs);
router.delete('/jobs/:jobId', auth, adminOnly, deleteJob);

// System Stats
router.get('/system-stats', auth, adminOnly, getSystemStats);

// Communication Management
router.get('/reports', auth, adminOnly, getReportedConversations);
router.get('/reports/:conversationId/messages', auth, adminOnly, getReportedMessages);
router.put('/reports/:conversationId/resolve', auth, adminOnly, resolveReport);

module.exports = router;
