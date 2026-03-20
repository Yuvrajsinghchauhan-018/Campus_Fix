const twilio = require('twilio');

/**
 * Sends an OTP via Twilio SMS
 * @param {string} phone - 10-digit phone number
 * @param {string} otp - 6-digit OTP
 */
const sendOTP = async (phone, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    throw new Error("Twilio credentials missing in .env");
  }

  const client = twilio(accountSid, authToken);

  // Format to E.164 (+91 for India)
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

  try {
    const message = await client.messages.create({
      body: `Your CampusFix OTP is: ${otp}. Valid for 5 minutes.`,
      from: fromPhone,
      to: formattedPhone
    });
    
    console.log(`OTP Sent to ${formattedPhone}. Message SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("Twilio Error Details:", error);
    // Throw a clear error for the controller to catch
    throw new Error(error.message || "Failed to send SMS via Twilio");
  }
};

module.exports = { sendOTP };
