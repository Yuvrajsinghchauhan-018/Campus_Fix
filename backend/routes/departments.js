const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDepartments)
  .post(authorize('authority'), createDepartment);

router.route('/:id')
  .patch(authorize('authority'), updateDepartment)
  .delete(authorize('authority'), deleteDepartment);

module.exports = router;
