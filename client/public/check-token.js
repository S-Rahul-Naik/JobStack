// Quick script to check localStorage token
console.log('=== CHECKING FRONTEND TOKEN ===');
const token = localStorage.getItem('token');
if (token) {
  console.log('Token found:', token.substring(0, 50) + '...');
  
  // Decode the JWT payload to see user info
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('User ID:', payload.id);
    console.log('Role:', payload.role);
    console.log('Issued at:', new Date(payload.iat * 1000));
    console.log('Current time:', new Date());
    
    // Check if token is expired
    if (payload.exp) {
      const expiry = new Date(payload.exp * 1000);
      console.log('Token expires:', expiry);
      console.log('Is expired?', expiry < new Date());
    }
  } catch (e) {
    console.error('Error parsing token:', e);
  }
} else {
  console.log('❌ No token found in localStorage!');
}

// Also check what user the AuthContext thinks is logged in
console.log('=== CHECKING AUTH CONTEXT ===');
// This will depend on how your auth context works
