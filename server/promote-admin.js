const mongoose = require('mongoose');
const User = require('./models/User');

async function promoteToAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobstack');
    console.log('Connected to MongoDB');
    
    // Get the email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node promote-admin.js <email>');
      console.log('Example: node promote-admin.js ram@gmail.com');
      return;
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }
    
    if (user.role === 'admin') {
      console.log(`✅ User ${user.name} (${email}) is already an admin`);
      return;
    }
    
    // Update role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`✅ Successfully promoted ${user.name} (${email}) to admin role`);
    console.log('\n🔑 ADMIN LOGIN DETAILS:');
    console.log(`Email: ${email}`);
    console.log('Password: [Use their existing password]');
    console.log('Role: admin');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

promoteToAdmin();
