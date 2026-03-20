const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

const startCronJobs = (io) => {
  // Check every hour for SLA breach
  cron.schedule('0 * * * *', async () => {
    try {
      const pendingComplaints = await Complaint.find({ status: { $ne: 'Resolved' }, deadline: { $lt: new Date() }, isEscalated: false });
      
      for (let complaint of pendingComplaints) {
        complaint.isEscalated = true;
        complaint.escalatedAt = new Date();
        await complaint.save();
        
        const authorities = await User.find({ role: 'authority' });
        
        io.emit('escalation_alert', { 
            complaintId: complaint._id, 
            roomNumber: complaint.roomNumber, 
            priority: complaint.priority 
        });

        for(let auth of authorities) {
          await sendEmail({
            email: auth.email,
            subject: `SLA Breached for Complaint in Room ${complaint.roomNumber}`,
            message: `Complaint "${complaint.title}" has breached its deadline and needs immediate attention.`
          });
        }
      }
    } catch (error) {
       console.error('Cron job error:', error);
    }
  });
};

module.exports = startCronJobs;
