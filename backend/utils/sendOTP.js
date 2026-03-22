/**
 * Simulates sending an OTP via Console Log (Twilio removed per user request)
 * @param {string} phone - 10-digit phone number
 * @param {string} otp - 6-digit OTP
 */
const sendOTP = async (phone, otp) => {
  console.log('\n==================================================');
  console.log(`🚀 DEVELOPMENT MODE: Simulated SMS dispatch`);
  console.log(`📱 To Phone: ${phone}`);
  console.log(`🔑 OTP Code: ${otp}`);
  console.log('==================================================\n');
  return { sid: 'simulated_dev_sid', success: true };
};

module.exports = { sendOTP };
