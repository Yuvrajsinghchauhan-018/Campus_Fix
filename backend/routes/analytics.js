const express = require('express');
const router = express.Router();
const { 
  getSummary, 
  getByCategory, 
  getByBlock, 
  getByDepartment, 
  getMonthlyTrend,
  downloadReport,
  createQR
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('authority'));

router.get('/summary', getSummary);
router.get('/by-category', getByCategory);
router.get('/by-block', getByBlock);
router.get('/by-department', getByDepartment);
router.get('/monthly', getMonthlyTrend);
router.get('/report', downloadReport);
router.post('/qr', createQR);

module.exports = router;
