const axios = require('axios');

async function testBasicAPI() {
  try {
    console.log('🧪 Testing basic API...');
    
    const response = await axios.get('http://localhost:5000/');
    
    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response data:`, response.data);
    
  } catch (error) {
    console.error('❌ Request failed:', error.response ? error.response.data : error.message);
  }
}

async function testAuthAPI() {
  try {
    console.log('🧪 Testing auth API...');
    
    const response = await axios.get('http://localhost:5000/api/auth/me');
    
    console.log(`📡 Response status: ${response.status}`);
    console.log(`📡 Response data:`, response.data);
    
  } catch (error) {
    console.error('❌ Auth request failed:', error.response ? error.response.data : error.message);
  }
}

async function runTests() {
  await testBasicAPI();
  console.log('---');
  await testAuthAPI();
}

runTests();
