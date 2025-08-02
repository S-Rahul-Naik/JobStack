// Test to simulate frontend API call
const testFrontendAPI = async () => {
  try {
    // This is exactly what the frontend NotificationContext is doing
    const API_BASE = 'http://localhost:5000/api';
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MmZhNDU3NDFmYjQwZmRlNzg3YzQ4ZCIsInJvbGUiOiJhcHBsaWNhbnQiLCJpYXQiOjE3NTQxNDQ1MTV9.R-zbl-7Iu55WwwaKzMUCpEka2Cl6PUZM9BySv9d9wso';
    
    console.log('🔍 Testing frontend-style API call...');
    console.log('API_BASE:', API_BASE);
    console.log('Full URL:', `${API_BASE}/notifications`);
    
    const response = await fetch(`${API_BASE}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Frontend should be able to fetch notifications');
      console.log('Notifications count:', data.notifications?.length || 0);
      console.log('Unread count:', data.unreadCount || 0);
    } else {
      console.log('❌ FAILED! Response status:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ FETCH ERROR:', error);
  }
};

// Run the test
testFrontendAPI();
