const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, verifyOTP, resendOTP, requestOTP } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
