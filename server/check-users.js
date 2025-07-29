// Quick test to check available users
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  await mongoose.connect('mongodb://localhost:27017/jobstack');
  
  const users = await User.find({ role: 'recruiter' }, 'name email role');
  console.log('Available recruiters:');
  users.forEach(user => {
    console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
  });
  
  await mongoose.disconnect();
}

checkUsers();
