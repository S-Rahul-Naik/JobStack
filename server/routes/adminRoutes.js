const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware'); // ✅ Required import
const { getAdminDashboard } = require('../controllers/adminController');

router.get('/dashboard', auth, adminOnly, getAdminDashboard);

module.exports = router;
