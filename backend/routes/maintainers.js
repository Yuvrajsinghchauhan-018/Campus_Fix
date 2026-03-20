const express = require('express');
const router = express.Router();
const { 
  getPendingMaintainers, 
  approveMaintainer, 
  rejectMaintainer, 
  getApprovedMaintainers 
} = require('../controllers/maintainerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('authority'));

router.get('/pending', getPendingMaintainers);
router.patch('/:id/approve', approveMaintainer);
router.patch('/:id/reject', rejectMaintainer);
router.get('/', getApprovedMaintainers);

module.exports = router;
