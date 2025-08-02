// Test CORS request exactly like browser
const axios = require('axios');

async function testBrowserLikeRequest() {
  try {
    console.log('🌐 Testing browser-like CORS request...');
    
    const response = await axios({
      method: 'GET',
      url: 'http://localhost:5000/api/notifications',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmZhNDU3NDFmYjQwZmRlNzg3YzQ4ZCIsInJvbGUiOiJhcHBsaWNhbnQiLCJpYXQiOjE3NTQxNDQ1MTV9.R-zbl-7Iu55WwwaKzMUCpEka2Cl6PUZM9BySv9d9wso',
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Referer': 'http://localhost:5173/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Browser Test'
      },
      timeout: 5000
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response headers:', response.headers);
    console.log('✅ Notifications count:', response.data.notifications?.length || 0);
    console.log('✅ Unread count:', response.data.unreadCount || 0);
    
  } catch (error) {
    console.error('❌ CORS/Browser request failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testBrowserLikeRequest();
