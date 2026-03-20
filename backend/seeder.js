const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();
    
    await User.deleteMany();
    await Department.deleteMany();
    await Complaint.deleteMany();
    await Announcement.deleteMany();
    await Notification.deleteMany();

    console.log('Database cleared.');

    // 1. Create Single Authority
    const authority = await User.create({
      name: 'College Authority',
      email: 'authority@campusfix.com',
      password: 'Authority@123',
      role: 'authority',
      isApproved: true,
      approvalStatus: 'approved'
    });

    // 2. Create Initial Departments (Necessary for registration logic/assignments)
    const departments = [
      { name: 'Electrical', headUser: authority._id },
      { name: 'Civil', headUser: authority._id },
      { name: 'IT', headUser: authority._id },
      { name: 'Housekeeping', headUser: authority._id }
    ];
    await Department.insertMany(departments);

    // 3. Initial Announcement
    await Announcement.create({
      title: 'System Live',
      message: 'Welcome to CampusFix. Please register to start using the platform.',
      postedBy: authority._id
    });

    console.log('Single Authority seeded: authority@campusfix.com / Authority@123');
    console.log('Essential departments seeded.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
