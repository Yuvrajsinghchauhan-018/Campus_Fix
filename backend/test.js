require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('./models/Complaint');
const User = require('./models/User');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const complaints = await Complaint.find({});
  console.log("ALL COMPLAINTS:\n", JSON.stringify(complaints.map(c => ({
    id: c._id,
    title: c.title,
    assignedAdmins: c.assignedAdmins,
    categories: c.categories,
    block: c.block,
    floor: c.floor
  })), null, 2));
  
  const admins = await User.find({ role: 'authority' });
  console.log("ALL ADMINS:\n", JSON.stringify(admins.map(a => ({
    id: a._id,
    name: a.name,
    block: a.block,
    responsibilities: a.responsibilities,
    floors: a.floors
  })), null, 2));

  process.exit(0);
}

test();
