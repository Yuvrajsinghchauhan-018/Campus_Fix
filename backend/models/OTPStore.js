const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const OTPStoreSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' } // MongoDB TTL index to auto-delete after 5 mins
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash OTP before saving
OTPStoreSchema.pre('save', async function() {
  if (!this.isModified('otp')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
});

// Method to check OTP
OTPStoreSchema.methods.matchOTP = async function(enteredOTP) {
  return await bcrypt.compare(enteredOTP, this.otp);
};

module.exports = mongoose.model('OTPStore', OTPStoreSchema);
