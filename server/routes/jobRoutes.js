const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createJob,
  getAllJobs,
  applyToJob,
  getApplicantsForRecruiter,
  updateApplicantStatus,
  getApplicantResume,
  exportApplicantsToExcel,
  deleteApplicant,
  getMyJobs,
  deleteJob,
  getRecruiterStats,
  getRecruiterTrends,
  getApplicantsCount
} = require('../controllers/jobController');

router.post('/create', auth, createJob);
router.get('/', getAllJobs);
router.post('/:id/apply', auth, applyToJob);
router.get('/applicants/all', auth, getApplicantsForRecruiter);
router.patch('/applicants/:applicationId/status', auth, updateApplicantStatus);
router.get('/applicants/:applicationId/resume', auth, getApplicantResume);
router.get('/applicants/export/excel', auth, exportApplicantsToExcel);
router.delete('/applicants/:applicationId', auth, deleteApplicant);
router.get('/my', auth, getMyJobs);
router.delete('/:id', auth, deleteJob);
router.get('/stats', auth, getRecruiterStats);
router.get('/trends', auth, getRecruiterTrends);
router.get('/:id/applicants/count', getApplicantsCount);

module.exports = router;
