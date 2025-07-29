const path = require('path');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Looking for server.js at:', path.join(__dirname, 'server.js'));

// Try to require the server file
try {
  require('./server.js');
} catch (error) {
  console.error('Error starting server:', error);
}
