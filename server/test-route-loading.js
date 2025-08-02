// Quick test to see if notification routes can be loaded
try {
  console.log('🔍 Testing notification routes import...');
  const notificationRoutes = require('./routes/notificationRoutes');
  console.log('✅ Notification routes loaded successfully');
  console.log('🔍 Routes object:', notificationRoutes);
  
  console.log('\n🔍 Testing notification controller import...');
  const notificationController = require('./controllers/notificationController');
  console.log('✅ Notification controller loaded successfully');
  console.log('🔍 Controller exports:', Object.keys(notificationController));
  
} catch (error) {
  console.error('❌ Error loading notification files:', error);
}
