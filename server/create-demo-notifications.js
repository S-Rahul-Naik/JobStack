// Demo script to create test notifications
const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobstack';

async function createDemoNotifications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Find a user to create notifications for
    const user = await User.findOne({ role: 'applicant' });
    if (!user) {
      console.log('❌ No applicant user found. Please create a user first.');
      return;
    }

    console.log(`🎯 Creating demo notifications for user: ${user.name}`);

    // Create sample notifications
    const demoNotifications = [
      {
        userId: user._id,
        title: '🎉 Welcome to JobStack!',
        message: 'Welcome to our job portal! Start exploring opportunities that match your skills.',
        type: 'system',
        actionUrl: '/dashboard',
        metadata: {
          source: 'welcome_flow'
        }
      },
      {
        userId: user._id,
        title: '📋 Application Status Update',
        message: 'Your application for Software Engineer at TechCorp has been shortlisted! The recruiter will contact you soon.',
        type: 'application',
        actionUrl: '/my-applications',
        metadata: {
          jobTitle: 'Software Engineer',
          companyName: 'TechCorp',
          status: 'shortlisted'
        }
      },
      {
        userId: user._id,
        title: '🎯 New Job Match Found',
        message: 'A new Frontend Developer position at StartupXYZ matches your skills. Apply now!',
        type: 'job_match',
        actionUrl: '/jobs/sample123',
        metadata: {
          jobTitle: 'Frontend Developer',
          companyName: 'StartupXYZ',
          matchPercentage: 85
        }
      },
      {
        userId: user._id,
        title: '💬 New Message from Recruiter',
        message: 'John from TechCorp sent you a message about your application.',
        type: 'message',
        actionUrl: '/chat/conv123',
        metadata: {
          senderName: 'John Smith',
          companyName: 'TechCorp'
        }
      },
      {
        userId: user._id,
        title: '⏰ Application Deadline Reminder',
        message: 'Don\'t forget! Your application for Data Scientist at DataCorp is due in 2 days.',
        type: 'application',
        actionUrl: '/jobs/data456',
        metadata: {
          jobTitle: 'Data Scientist',
          companyName: 'DataCorp',
          daysRemaining: 2
        }
      }
    ];

    // Insert notifications
    for (const notifData of demoNotifications) {
      const notification = new Notification(notifData);
      await notification.save();
      console.log(`✅ Created: ${notifData.title}`);
    }

    console.log(`🎊 Successfully created ${demoNotifications.length} demo notifications!`);
    console.log(`📱 You can now test the notification system in the application.`);

  } catch (error) {
    console.error('❌ Error creating demo notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the demo
createDemoNotifications();
