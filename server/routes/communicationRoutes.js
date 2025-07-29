// server/routes/communicationRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  startConversation,
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  uploadFile,
  sendFile,
  reportConversation,
  getUnreadCount
} = require('../controllers/communicationController');

// Start conversation (recruiter only, after shortlisting)
router.post('/start', auth, startConversation);

// Get user's conversations
router.get('/conversations', auth, getConversations);

// Get single conversation by ID
router.get('/conversations/:conversationId', auth, getConversation);

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', auth, getMessages);

// Send text message
router.post('/messages', auth, sendMessage);

// Upload and send file/video
router.post('/upload', auth, uploadFile, sendFile);

// Report conversation
router.post('/report', auth, reportConversation);

// Get unread messages count and recent messages
router.get('/unread-count', auth, getUnreadCount);

module.exports = router;
