// server/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const app = express();

// Configure CORS to specifically allow the frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

console.log('Environment variables check:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined. Using default connection string.');
    mongoose.connect('mongodb://localhost:27017/jobstack')
    .then(() => console.log('✅ MongoDB connected with default URI'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
} else {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

app.get('/', (req, res) => {
    res.send('JobStack API running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
