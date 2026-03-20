const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Electrical', 'Plumbing', 'Furniture', 'Computer', 'AC', 'Carpentry', 'Other'],
    required: true
  },
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
  roomNumber: { type: String, required: true },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  photos: [{ type: String }],
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
