const mongoose = require('mongoose');
const User = require('./models/User');

async function resetExperienceData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jobstack');
    console.log('Connected to MongoDB');
    
    // Reset all fake experience data to null so users can self-declare
    const result = await User.updateMany(
      {
        experience: {
          $in: [
            '0-1 years - Fresh Graduate',
            '1-2 years - Junior Level',
            '2-4 years - Mid Level',
            '4-6 years - Senior Level',
            '6+ years - Expert Level',
            'Student - Currently pursuing studies',
            '0 years - Career Changer'
          ]
        }
      },
      {
        $unset: { experience: "" }
      }
    );
    
    console.log(`✅ Reset experience data for ${result.modifiedCount} users`);
    console.log('Users will now be prompted to self-declare their experience on next login');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetExperienceData();
