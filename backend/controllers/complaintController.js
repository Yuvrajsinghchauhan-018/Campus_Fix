const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { analyzeComplaint } = require('../utils/aiPriority');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private/Student
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, roomNumber, block, floor } = req.body;
    let photos = [];
    
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => file.path || `https://via.placeholder.com/600x400?text=Local+Upload+Ignored`);
    }

    const aiResult = await analyzeComplaint(title, description);

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      aiSuggestedPriority: aiResult ? aiResult.priority : null,
      aiSuggestedCategory: aiResult ? aiResult.category : null,
      aiReason: aiResult ? aiResult.reason : null,
      aiEstimatedFixTime: aiResult ? aiResult.estimatedFixTimeHours : null,
      roomNumber,
      block,
      floor,
      photos,
      submittedBy: req.user.id
    });

    // io logic can be added here or from req.app.get('socketio')

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all complaints filtered by role
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.submittedBy = req.user.id;
    } else if (req.user.role === 'maintainer') {
      query.assignedTo = req.user.id;
    }
    
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email collegeId')
      .populate('assignedTo', 'name email jobType')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email collegeId phone')
      .populate('assignedTo', 'name email jobType phone');

    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve and assign complaint
// @route   PATCH /api/complaints/:id/approve-assign
// @access  Private/Authority
exports.approveAndAssign = async (req, res) => {
  try {
    const { assignedTo, deadline, internalNote } = req.body;
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    complaint.assignedTo = assignedTo;
    complaint.deadline = deadline;
    complaint.status = 'Assigned';
    if(internalNote) complaint.resolutionNote = internalNote;
    
    await complaint.save();

    // Socket io alert later
    
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Maintainer/Authority)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    complaint.status = status;
    await complaint.save();
    
    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Resolve complaint
// @route   PATCH /api/complaints/:id/resolve
// @access  Private/Maintainer
exports.resolveComplaint = async (req, res) => {
  try {
    const { resolutionNote } = req.body;
    let completionPhoto = req.file ? (req.file.path || `https://via.placeholder.com/600x400?text=Local+Upload+Ignored`) : null;
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    complaint.status = 'Resolved';
    complaint.resolvedAt = Date.now();
    complaint.resolutionNote = resolutionNote || complaint.resolutionNote;
    complaint.completionPhoto = completionPhoto;
    
    await complaint.save();
    
    // update maintainer stats
    const maintainer = await User.findById(req.user.id);
    maintainer.totalTasksCompleted += 1;
    await maintainer.save();

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Rate complaint
// @route   PATCH /api/complaints/:id/rate
// @access  Private/Student
exports.rateComplaint = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    complaint.rating = rating;
    complaint.feedback = feedback;
    await complaint.save();
    
    if (complaint.assignedTo) {
      const maintainer = await User.findById(complaint.assignedTo);
      // naive average mapping
      maintainer.performanceScore = ((maintainer.performanceScore * (maintainer.totalTasksCompleted - 1)) + Number(rating)) / maintainer.totalTasksCompleted;
      await maintainer.save();
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private/Authority
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    await complaint.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
