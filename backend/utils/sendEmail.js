/**
 * Simulates sending an email via Console Log (Twilio removed per user request)
 * @param {object} options - Email options { email, subject, message, html }
 */
const sendEmail = async (options) => {
  console.log('\n==================================================');
  console.log(`📧 SIMULATED EMAIL DISPATCH`);
  console.log(`📬 To: ${options.email}`);
  console.log(`📌 Subject: ${options.subject}`);
  console.log(`📄 Message: ${options.message || 'No text content'}`);
  console.log('==================================================\n');
  return { success: true, messageId: 'simulated_email_id' };
};

module.exports = sendEmail;
