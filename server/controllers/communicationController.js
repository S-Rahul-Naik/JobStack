// server/controllers/communicationController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Application = require('../models/Application');
const aiService = require('../services/aiService');
const multer = require('multer');
const path = require('path');

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow text files, images, videos, and documents
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// Start conversation (triggered when applicant is shortlisted)
exports.startConversation = async (req, res) => {
  try {
    const { applicationId } = req.body;
    
    // Get application details
    const application = await Application.findById(applicationId)
      .populate('applicantId')
      .populate('jobId');
      
    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Only shortlisted applications can start conversations
    if (application.status !== 'shortlisted') {
      return res.status(400).json({ msg: 'Conversation can only start after shortlisting' });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      applicantId: application.applicantId._id,
      recruiterId: req.user.id,
      jobId: application.jobId._id,
      applicationId: applicationId
    });

    if (existingConversation) {
      return res.json({ conversation: existingConversation });
    }

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
        text: `🎉 Conversation started! ${application.applicantId.name} has been shortlisted for ${application.jobId.title}. You can now communicate directly.`
      },
      aiAnalysis: {
        fraudScore: 0,
        sentimentScore: 0,
        riskFlags: [],
        inappropriate: false,
        suspiciousKeywords: [],
        analysisTimestamp: new Date()
      }
    });

    await systemMessage.save();

    res.json({ 
      conversation,
      message: 'Conversation started successfully',
      systemMessage
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get user's conversations
exports.getConversations = async (req, res) => {
  try {
    const query = req.user.role === 'applicant' 
      ? { applicantId: req.user.id }
      : { recruiterId: req.user.id };

    const conversations = await Conversation.find(query)
      .populate('applicantId', 'name email')
      .populate('recruiterId', 'name email')
      .populate('jobId', 'title companyName')
      .sort({ lastActivity: -1 });

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get single conversation by ID
exports.getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Get conversation and verify user has access
    const conversation = await Conversation.findById(conversationId)
      .populate('applicantId', 'name email role')
      .populate('recruiterId', 'name email role companyName');
    
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    if (conversation.applicantId._id.toString() !== userId && 
        conversation.recruiterId._id.toString() !== userId) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json({ conversation });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    const isParticipant = conversation.applicantId.toString() === req.user.id || 
                         conversation.recruiterId.toString() === req.user.id;
    
    if (!isParticipant) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId,
        senderId: { $ne: req.user.id },
        'readBy.userId': { $ne: req.user.id }
      },
      { 
        $push: { 
          readBy: { 
            userId: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Send text message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    const isParticipant = conversation.applicantId.toString() === req.user.id || 
                         conversation.recruiterId.toString() === req.user.id;
    
    if (!isParticipant) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // AI Analysis of the message
    const aiAnalysis = aiService.analyzeMessage(content);

    // Create message
    const message = new Message({
      conversationId,
      senderId: req.user.id,
      senderType: req.user.role,
      messageType: 'text',
      content: { text: content },
      aiAnalysis
    });

    await message.save();

    // Update conversation activity
    await conversation.updateActivity();

    // Check if AI should trigger alert
    if (aiService.shouldTriggerAlert(aiAnalysis)) {
      // Add AI flag to conversation
      // conversation.aiFlags.push({
      //   type: 'high_risk_message',
      //   timestamp: new Date(),
      //   severity: aiAnalysis.fraudScore > 80 ? 'critical' : 'high'
      // });
      conversation.aiRiskScore = Math.max(conversation.aiRiskScore, aiAnalysis.fraudScore);
      await conversation.save();

      // Generate warning for recipient (but don't send yet - will be shown in UI)
      const warningMessage = aiService.generateWarningMessage(aiAnalysis);
      if (warningMessage) {
        // This will be handled by the frontend
      }
    }

    // Populate sender info for response
    await message.populate('senderId', 'name role');

    res.json({ 
      message,
      aiWarning: aiService.generateWarningMessage(aiAnalysis)
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Upload and send file/video
exports.uploadFile = upload.single('file');

exports.sendFile = async (req, res) => {
  try {
    const { conversationId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    const isParticipant = conversation.applicantId.toString() === req.user.id || 
                         conversation.recruiterId.toString() === req.user.id;
    
    if (!isParticipant) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Determine message type
    let messageType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      messageType = 'video';
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: req.user.id,
      senderType: req.user.role,
      messageType,
      content: {
        fileName: req.file.originalname,
        fileUrl: `/uploads/chat/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      },
      aiAnalysis: {
        fraudScore: 0, // Files get basic analysis
        sentimentScore: 0,
        riskFlags: [],
        inappropriate: false,
        suspiciousKeywords: [],
        analysisTimestamp: new Date()
      }
    });

    await message.save();
    await conversation.updateActivity();
    await message.populate('senderId', 'name role');

    res.json({ message });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Report conversation
exports.reportConversation = async (req, res) => {
  try {
    const { conversationId, reason, evidence } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // Verify user is participant
    const isParticipant = conversation.applicantId.toString() === req.user.id || 
                         conversation.recruiterId.toString() === req.user.id;
    
    if (!isParticipant) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Update conversation with report
    conversation.status = 'reported';
    conversation.reportedBy = req.user.id;
    conversation.reportDetails = {
      reason,
      evidence: evidence || [],
      reportedAt: new Date()
    };

    await conversation.save();

    res.json({ msg: 'Conversation reported successfully. Admin will review this case.' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get unread messages count and recent messages for notifications
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all conversations for this user
    const conversations = await Conversation.find({
      $or: [
        { applicantId: userId },
        { recruiterId: userId }
      ],
      status: { $ne: 'closed' }
    }).populate('applicantId recruiterId', 'name email');

    let totalUnreadCount = 0;
    const recentMessages = [];

    for (const conversation of conversations) {
      // Get unread messages in this conversation
      const unreadMessages = await Message.find({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId }
      }).populate('senderId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      totalUnreadCount += unreadMessages.length;

      // Add recent messages to the list
      unreadMessages.forEach(message => {
        recentMessages.push({
          conversationId: conversation._id,
          senderName: message.senderId.name,
          messageType: message.messageType,
          content: message.content,
          createdAt: message.createdAt,
          aiAnalysis: message.aiAnalysis
        });
      });
    }

    // Sort recent messages by date and limit to 10
    recentMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedRecentMessages = recentMessages.slice(0, 10);

    res.json({ 
      unreadCount: totalUnreadCount,
      recentMessages: limitedRecentMessages
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = exports;
