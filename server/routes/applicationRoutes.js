// routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { getMyApplications } = require('../controllers/applicationController');

router.get('/my', auth, getMyApplications);
module.exports = router;
