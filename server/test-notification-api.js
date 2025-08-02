const axios = require('axios');

async function testNotificationAPI() {
  try {
    // Test with jaggu's user ID token (from a recent login)
    const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmZhNDU3NDFmYjQwZmRlNzg3YzQ4ZCIsInJvbGUiOiJhcHBsaWNhbnQiLCJpYXQiOjE3NTQxNDQ1MTV9.R-zbl-7Iu55WwwaKzMUCpEka2Cl6PUZM9BySv9d9wso';
    
    console.log('🧪 Testing notification API...');
    
    const response = await axios.get('http://localhost:5000/api/notifications', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response data:`, response.data);
    
    if (response.status === 200) {
      console.log('✅ API Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ API Error:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.response ? error.response.data : error.message);
  }
}

testNotificationAPI();
