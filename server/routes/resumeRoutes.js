// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { uploadResumeAndMatch } = require('../controllers/resumeController');

router.post('/upload', auth, upload.single('resume'), uploadResumeAndMatch);

module.exports = router;
