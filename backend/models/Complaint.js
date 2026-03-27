const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: [{ 
    type: String, 
    enum: ['Electrical', 'Plumbing', 'Lab Management', 'IT Systems', 'Infrastructure']
  }],
  issues: [{ type: String }],
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    required: true
  },
  aiSuggestedPriority: { type: String },
  aiSuggestedCategory: { type: String },
  aiReason: { type: String },
  aiEstimatedFixTime: { type: Number },
  status: { 
    type: String, 
    enum: ['Pending', 'Assigned', 'Accepted', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  locationType: { 
    type: String, 
    enum: ['Lab', 'Classroom', 'Corridor', 'Staff Room', 'Washroom', 'Common Area'],
    default: 'Classroom'
  },
  roomNumber: { type: String, required: true },
  block: { type: String, enum: ['MSI', 'MSIT', 'MBA'], required: true },
  floor: { type: String, required: true },
  photos: [{ type: String }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedMaintainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAdmins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignmentReason: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  deadline: { type: Date },
  resolvedAt: { type: Date },
  resolutionNote: { type: String },
  resolutionPhoto: { type: String },
  completionPhoto: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  isEscalated: { type: Boolean, default: false },
  escalatedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
