require('dotenv').config();

console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
} else {
  console.log('MONGO_URI is properly configured');
}
