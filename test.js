require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./backend/models/Complaint');
const User = require('./backend/models/User');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const complaints = await Complaint.find({});
  console.log("ALL COMPLAINTS:", complaints.map(c => ({
    id: c._id,
    title: c.title,
    assignedAdmins: c.assignedAdmins,
    categories: c.categories,
    block: c.block,
    floor: c.floor
  })));
  
  const admins = await User.find({ role: 'authority' });
  console.log("ALL ADMINS:", admins.map(a => ({
    id: a._id,
    name: a.name,
    block: a.block,
    responsibilities: a.responsibilities,
    floors: a.floors
  })));

  process.exit(0);
}

test();
