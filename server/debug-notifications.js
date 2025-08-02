const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');

async function debugNotifications() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobstack');
    console.log('📧 Connected to MongoDB');
    
    const users = await User.find({}, '_id name email role').limit(5);
    console.log('\n👥 Available users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id} - Role: ${user.role}`);
    });
    
    const notifications = await Notification.find({}).populate('userId', 'name email');
    console.log('\n🔔 Current notifications:');
    notifications.forEach(notif => {
      console.log(`- "${notif.title}" for ${notif.userId?.name || 'Unknown User'} (${notif.userId?._id || 'No ID'})`);
    });
    
    // Find the user "jaggu" specifically
    const jagguUser = await User.findOne({ name: 'jaggu' });
    if (jagguUser) {
      console.log(`\n🎯 User "jaggu" found: ID ${jagguUser._id}`);
      const jagguNotifications = await Notification.find({ userId: jagguUser._id });
      console.log(`📝 Notifications for jaggu: ${jagguNotifications.length}`);
      jagguNotifications.forEach(notif => {
        console.log(`  - ${notif.title} (${notif.read ? 'read' : 'unread'})`);
      });
    } else {
      console.log('\n❌ User "jaggu" not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugNotifications();
