const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String,
    select: false
  },
  role: { 
    type: String, 
    enum: ['student', 'authority', 'maintainer'],
    required: true,
    trim: true,
    lowercase: true
  },
  collegeId: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  },
  staffId: { type: String, unique: true, sparse: true },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true,
    trim: true
  },
  jobType: { 
    type: String, 
    enum: ['Electrician', 'Plumber', 'IT Technician', 'AC Mechanic', 'Carpenter', 'Painter', 'Civil Worker', 'Sweeper']
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  profilePhoto: { type: String },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'Off Duty'],
    default: 'Available'
  },
  performanceScore: { type: Number, default: 0 },
  totalTasksCompleted: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Encrypt password (only if it exists)
UserSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
