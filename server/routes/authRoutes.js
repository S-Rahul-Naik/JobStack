// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
