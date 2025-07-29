const mongoose = require('mongoose');
const User = require('./models/User');

async function addTimestampsToExistingUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobstack');
    console.log('Connected to MongoDB');
    
    // Find users without createdAt field
    const usersWithoutTimestamps = await User.find({ createdAt: { $exists: false } });
    console.log(`Found ${usersWithoutTimestamps.length} users without timestamps`);
    
    if (usersWithoutTimestamps.length > 0) {
      // Set a default registration date (current date minus some random days for variety)
      const baseDate = new Date('2024-01-01'); // Start from Jan 1, 2024
      const now = new Date();
      
      for (let i = 0; i < usersWithoutTimestamps.length; i++) {
        const user = usersWithoutTimestamps[i];
        
        // Generate a random date between baseDate and now
        const randomTime = baseDate.getTime() + Math.random() * (now.getTime() - baseDate.getTime());
        const randomDate = new Date(randomTime);
        
        await User.findByIdAndUpdate(user._id, {
          createdAt: randomDate,
          updatedAt: randomDate
        });
        
        console.log(`Updated ${user.name} (${user.email}) with registration date: ${randomDate.toLocaleDateString()}`);
      }
      
      console.log('✅ All users updated with timestamps');
    } else {
      console.log('✅ All users already have timestamps');
    }
    
    // Now let's also add some sample experience data for users who don't have it
    const usersWithoutExperience = await User.find({ 
      $or: [
        { experience: { $exists: false } },
        { experience: '' },
        { experience: null }
      ]
    });
    
    console.log(`\nFound ${usersWithoutExperience.length} users without experience`);
    
    const sampleExperiences = [
      '0-1 years - Fresh Graduate',
      '1-2 years - Junior Level',
      '2-4 years - Mid Level',
      '4-6 years - Senior Level',
      '6+ years - Expert Level',
      'Student - Currently pursuing studies',
      '0 years - Career Changer'
    ];
    
    for (let user of usersWithoutExperience) {
      const randomExperience = sampleExperiences[Math.floor(Math.random() * sampleExperiences.length)];
      await User.findByIdAndUpdate(user._id, {
        experience: randomExperience
      });
      console.log(`Updated ${user.name} with experience: ${randomExperience}`);
    }
    
    console.log('✅ All users updated with experience data');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addTimestampsToExistingUsers();
