const mongoose = require('mongoose');
const User = require('./models/User');

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobstack');
    console.log('Connected to MongoDB');
    
    // Default admin credentials
    const adminData = {
      name: 'Admin',
      email: 'admin@jobstack.com',
      password: 'admin123',
      role: 'admin'
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('Current role:', existingAdmin.role);
      
      if (existingAdmin.role !== 'admin') {
        // Update role to admin
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated user role to admin');
      }
    } else {
      // Create new admin user
      const admin = new User(adminData);
      await admin.save();
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n🔑 ADMIN LOGIN DETAILS:');
    console.log('Email: admin@jobstack.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('\n📝 You can now login at: http://localhost:5173/login');
    console.log('After login, you will be redirected to: http://localhost:5173/admin');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin();
