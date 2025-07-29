// server/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check if profile needs completion (missing experience for non-admin users)
    const needsProfileUpdate = user.role !== 'admin' && !user.experience;

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user,
      needsProfileUpdate,
      message: needsProfileUpdate ? 'Please complete your profile by adding your experience level' : null
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, experience, skills } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // will be hashed by pre-save hook
    if (experience) {
      user.experience = experience;
      user.profileComplete = true; // Mark profile as complete when experience is added
    }
    if (skills) user.skills = skills;

    await user.save();
    res.json({ 
      msg: 'Profile updated successfully', 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role,
        experience: user.experience,
        skills: user.skills,
        profileComplete: user.profileComplete
      } 
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'No user with that email' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Send email (for demo, just log the link)
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    // In production, use nodemailer to send email
    console.log('Password reset link:', resetLink);
    res.json({ msg: 'Password reset link sent to email (check server log in dev)' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ msg: 'Invalid or expired token' });
  }
};
