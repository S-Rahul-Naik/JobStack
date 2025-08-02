// server/controllers/notificationController.js
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      read: false 
    });

    res.json({
      notifications,
      unreadCount,
      success: true
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    res.json({ 
      notification,
      success: true 
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ 
      success: true,
      msg: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Create notification (internal function)
exports.createNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      userId,
      ...notificationData,
      createdAt: new Date()
    });

    await notification.save();
    return notification;
  } catch (err) {
    console.error('Create notification error:', err);
    return null;
  }
};

// Send notification to multiple users
exports.createBulkNotifications = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      ...notificationData,
      createdAt: new Date()
    }));

    await Notification.insertMany(notifications);
    return true;
  } catch (err) {
    console.error('Create bulk notifications error:', err);
    return false;
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    res.json({ 
      success: true,
      msg: 'Notification deleted'
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get notification preferences
exports.getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationPreferences');
    
    const defaultPreferences = {
      email: true,
      push: true,
      sms: false,
      types: {
        messages: true,
        applications: true,
        jobs: true,
        system: true
      }
    };

    res.json({
      preferences: user.notificationPreferences || defaultPreferences,
      success: true
    });
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update notification preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    await User.findByIdAndUpdate(
      req.user.id,
      { notificationPreferences: preferences },
      { new: true }
    );

    res.json({
      preferences,
      success: true,
      msg: 'Notification preferences updated'
    });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
