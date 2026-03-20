const express = require('express');
const router = express.Router();
const { 
  createComplaint, 
  getComplaints, 
  getComplaint, 
  approveAndAssign, 
  updateStatus, 
  resolveComplaint, 
  rateComplaint, 
  deleteComplaint 
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { checkApproved } = require('../middleware/checkApproved');
const { upload } = require('../middleware/upload');

router.use(protect);

router.route('/')
  .post(authorize('student'), upload.array('photos', 3), createComplaint)
  .get(checkApproved, getComplaints);

router.route('/:id')
  .get(checkApproved, getComplaint)
  .delete(authorize('authority'), deleteComplaint);

router.patch('/:id/approve-assign', authorize('authority'), approveAndAssign);
router.patch('/:id/status', checkApproved, updateStatus);
router.patch('/:id/resolve', authorize('maintainer'), checkApproved, upload.single('completionPhoto'), resolveComplaint);
router.patch('/:id/rate', authorize('student'), rateComplaint);

module.exports = router;
