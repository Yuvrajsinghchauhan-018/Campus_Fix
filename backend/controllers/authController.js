const User = require('../models/User');
const OTPStore = require('../models/OTPStore');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/sendOTP');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, collegeId, phone, gender, jobType, adminSecretKey, floor, responsibilities, block } = req.body;

    if (role === 'authority') {
      if (!name || !email || !phone || !adminSecretKey) {
        return res.status(400).json({ message: "Name, email, phone, and Admin Secret Key are required." });
      }
      if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(401).json({ message: "Invalid Admin Secret Key." });
      }
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(400).json({ message: "Email already registered." });

      const user = await User.create({
        name, phone, role, email: email.toLowerCase(), floors, responsibilities, block,
        isApproved: true,
        approvalStatus: 'Approved'
      });

      const token = generateToken(user._id);
      return res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role }, message: "Registration successful!" });
    }

    if (!name || !phone || !role) {
      return res.status(400).json({ message: "Please fill all required fields (Name, Phone, Role)." });
    }

    // Check uniqueness
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: "This phone number is already registered." });

    if (role === 'student') {
      if (!email || !collegeId || !password) {
        return res.status(400).json({ message: "Please fill all student registration fields." });
      }
      if (!email.toLowerCase().endsWith('@gmail.com')) {
        return res.status(400).json({ message: "Student email must be a valid @gmail.com address." });
      }

      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(400).json({ message: "Email already registered." });

      const existingId = await User.findOne({ collegeId });
      if (existingId) return res.status(400).json({ message: "College ID already registered." });

      // PART 1: STUDENT DIRECT REGISTRATION (No OTP)
      const user = await User.create({
        name, phone, role, email: email.toLowerCase(), collegeId, password, gender,
        isApproved: true,
        approvalStatus: 'approved'
      });

      const token = generateToken(user._id);
      return res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role }, message: "Registration successful!" });
    }

    if (role === 'maintainer') {
      if (!jobType) return res.status(400).json({ message: "Please select a job type." });

      // PART 2: MAINTAINER DIRECT REGISTRATION (No OTP)
      const user = await User.create({
        name,
        phone,
        role: 'maintainer',
        jobType,
        approvalStatus: 'pending',
        isApproved: false
      });

      return res.status(201).json({ 
        success: true, 
        message: "Registration successful! Your account is under review. You will be notified once approved." 
      });
    }

    res.status(400).json({ message: "Invalid role specified." });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: error.message || "Internal server error during registration." });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, collegeId, phone, password, role } = req.body;

    // 1. Authority Login (Email/Admin Secret Key only - Direct)
    if (role === 'authority') {
      const secretKey = req.body.adminSecretKey || password; // Frontend might send it as password or adminSecretKey
      if (!email || !secretKey) return res.status(400).json({ message: "Email and Admin Secret Key required." });
      if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(401).json({ message: "Invalid Admin Secret Key." });
      }
      const user = await User.findOne({ email: email.toLowerCase(), role: 'authority' });
      if (!user) {
        return res.status(401).json({ message: "Invalid authority credentials." });
      }
      const token = generateToken(user._id);
      return res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
    }

    // 2. Student Login (Email/ID + Pass - Direct)
    if (role === 'student') {
      if ((!email && !collegeId) || !password) return res.status(400).json({ message: "Credentials and Password required." });
      
      const user = email 
        ? await User.findOne({ email: email.toLowerCase(), role: 'student' }).select('+password')
        : await User.findOne({ collegeId, role: 'student' }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid student credentials." });
      }

      const token = generateToken(user._id);
      return res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
    }

    // 3. Maintainer Login (Phone only - Direct)
    if (role === 'maintainer') {
      if (!phone) return res.status(400).json({ message: "Phone number required." });
      let user = await User.findOne({ phone, role: 'maintainer' });
      
      if (!user) {
        return res.status(404).json({ message: "No account found. Ask authority to add you or request access via Registration." });
      }
      
      const status = user.approvalStatus.toLowerCase();
      if (status === 'pending') {
        return res.status(403).json({ message: "Waiting for approval" });
      }
      if (status === 'rejected') {
        return res.status(403).json({ message: "Your application was not approved." });
      }

      const token = generateToken(user._id);
      return res.status(200).json({ 
        success: true, 
        token, 
        user: { 
          id: user._id, 
          name: user.name, 
          role: user.role, 
          approvalStatus: user.approvalStatus, 
          isApproved: user.isApproved 
        } 
      });
    }
    res.status(400).json({ message: "Invalid role specified." });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || "Internal server error during login." });
  }
};

// @desc    Send OTP to Phone (Maintainer only)
// @route   POST /api/auth/send-otp
exports.requestOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required." });

    const user = await User.findOne({ phone, role: 'maintainer' });
    if (!user) return res.status(404).json({ message: "No account found with this phone number." });

    const otp = generateOTP();
    try {
      await sendOTP(phone, otp);
      await OTPStore.findOneAndUpdate(
        { phone }, 
        { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, 
        { upsert: true, new: true }
      );
      res.status(200).json({ success: true, message: "OTP sent successfully!" });
    } catch (twilioErr) {
      res.status(500).json({ message: "Failed to send OTP: " + twilioErr.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, isRegistration, userData } = req.body;

    if (!phone || !otp) return res.status(400).json({ message: "Phone and OTP are required." });

    const record = await OTPStore.findOne({ phone });
    if (!record || !(await record.matchOTP(otp))) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Success - Clear OTP records
    await OTPStore.deleteOne({ phone });

    if (isRegistration) {
      // Maintainer Registration Finalize
      const user = await User.create({
        ...userData,
        role: userData.role || 'maintainer', // Ensure role is present and correct
        phone,
        approvalStatus: 'pending',
        isApproved: false
      });

      return res.status(201).json({ 
        success: true, 
        message: "Your account is under review. You will be notified once approved." 
      });
    } else {
      // Maintainer Login Finalize
      const user = await User.findOne({ phone, role: 'maintainer' });
      if (!user) return res.status(404).json({ message: "User not found." });

      if (user.approvalStatus === 'pending') {
        return res.status(403).json({ message: "Your account is still under review." });
      }
      if (user.approvalStatus === 'rejected') {
        return res.status(403).json({ message: "Your application was not approved." });
      }

      const token = generateToken(user._id);
      return res.status(200).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
    }
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: error.message || "Internal server error during verification." });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required." });

    const otp = generateOTP();
    try {
      await sendOTP(phone, otp);
      await OTPStore.findOneAndUpdate(
        { phone }, 
        { otp, expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, 
        { upsert: true, new: true }
      );
      res.status(200).json({ success: true, message: "OTP Resent successfully!" });
    } catch (twilioErr) {
      res.status(500).json({ message: "Failed to send OTP: " + twilioErr.message });
    }
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ message: error.message || "Failed to resend OTP." });
  }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout
exports.logout = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out" });
};
