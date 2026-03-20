const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('authority'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
