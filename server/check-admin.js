const mongoose = require('mongoose');
const User = require('./models/User');

async function findAdmins() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobstack');
    console.log('Connected to MongoDB');
    
    const admins = await User.find({ role: 'admin' }).select('name email role');
    console.log('\n=== ADMIN USERS FOUND ===');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in the database.');
      console.log('\n📝 To create an admin user:');
      console.log('1. Register a normal user first');
      console.log('2. Then manually update their role to "admin" in MongoDB');
      console.log('3. Or create a seed script to add default admin');
    } else {
      console.log(`✅ Found ${admins.length} admin user(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`);
        console.log(`  Name: ${admin.name}`);
        console.log(`  Email: ${admin.email}`);
        console.log(`  Role: ${admin.role}`);
        console.log('  Password: [Encrypted - Use this email to login]');
        console.log('---');
      });
    }
    
    // Also check all users to see available accounts
    const allUsers = await User.find().select('name email role');
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    console.log('All users:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('🔧 Make sure MongoDB is running on localhost:27017');
    }
  }
}

findAdmins();
