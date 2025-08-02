// server/models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['message', 'application', 'job', 'job_match', 'system', 'reminder'],
    required: true,
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    maxlength: 500
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// Virtual for time ago
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
});

// Instance method to mark as read
NotificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return await this.save();
};

// Static method to create notification
NotificationSchema.statics.createForUser = async function(userId, notificationData) {
  const notification = new this({
    userId,
    ...notificationData
  });
  return await notification.save();
};

// Static method to mark all user notifications as read
NotificationSchema.statics.markAllAsReadForUser = async function(userId) {
  return await this.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Static method to get unread count for user
NotificationSchema.statics.getUnreadCountForUser = async function(userId) {
  return await this.countDocuments({ userId, read: false });
};

// Static method to cleanup old notifications
NotificationSchema.statics.cleanupOldNotifications = async function(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);
