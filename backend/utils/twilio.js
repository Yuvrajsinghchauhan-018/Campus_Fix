const twilio = require('twilio');

const sendSMS = async (to, body) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Ensure phone number starts with +91 if it doesn't already
    // (Assuming Indian context based on the user's phone example +91...)
    const formattedTo = to.startsWith('+') ? to : `+91${to}`;

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedTo
    });

    console.log(`OTP SMS sent to ${formattedTo}: SID ${message.sid}`);
    return message;
  } catch (error) {
    console.error('Twilio SMS Error:', error.message);
    throw new Error('Failed to send OTP SMS. Please check your phone number.');
  }
};

module.exports = { sendSMS };
