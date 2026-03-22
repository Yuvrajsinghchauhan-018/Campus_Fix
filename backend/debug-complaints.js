require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const allComps = await Complaint.find({}).populate('assignedMaintainer', 'name');
  
  const queue = allComps.filter(c => !c.assignedMaintainer && c.status !== 'Resolved' && c.status !== 'Rejected');
  const assigned = allComps.filter(c => c.assignedMaintainer && c.status !== 'Resolved' && c.status !== 'Rejected');
  const completed = allComps.filter(c => c.status === 'Resolved');
  const dismissed = allComps.filter(c => c.status === 'Rejected');

  console.log("QUEUE:");
  queue.forEach(c => console.log(` - ${c.title} | Status: ${c.status} | Maintainer: ${c.assignedMaintainer ? c.assignedMaintainer.name : 'None'}`));
  
  console.log("\nASSIGNED:");
  assigned.forEach(c => console.log(` - ${c.title} | Status: ${c.status} | Maintainer: ${c.assignedMaintainer ? c.assignedMaintainer.name : 'None'}`));
  
  console.log("\nCOMPLETED:");
  completed.forEach(c => console.log(` - ${c.title} | Status: ${c.status}`));

  process.exit(0);
}

test();
