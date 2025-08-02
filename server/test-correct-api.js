const axios = require('axios');

async function testCorrectAPI() {
  try {
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmZhNDU3NDFmYjQwZmRlNzg3YzQ4ZCIsInJvbGUiOiJhcHBsaWNhbnQiLCJpYXQiOjE3NTQxNDQ1MTV9.R-zbl-7Iu55WwwaKzMUCpEka2Cl6PUZM9BySv9d9wso';
    
    console.log('🧪 Testing auth profile...');
    
    try {
      const authResponse = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Auth status: ${authResponse.status}`);
      console.log(`✅ Auth data:`, authResponse.data);
    } catch (authError) {
      console.log('❌ Auth failed:', authError.response ? authError.response.data : authError.message);
    }
    
    console.log('\n🧪 Testing notifications...');
    
    const notificationResponse = await axios.get('http://localhost:5000/api/notifications', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Notification status: ${notificationResponse.status}`);
    console.log(`✅ Notification data:`, JSON.stringify(notificationResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Notification request failed:', error.response ? error.response.data : error.message);
  }
}

testCorrectAPI();
