const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { analyzeComplaint } = require('../utils/aiPriority');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private/Student
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, locationType, roomNumber, block, floor, computerNumber, mouseNumber, keyboardNumber, printerNumber } = req.body;
    let issues = req.body.issues || [];
    if (!Array.isArray(issues)) issues = [issues]; // Handle single string or undefined
    issues = issues.filter(Boolean); // Clean any empties
    let photos = [];
    
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    const aiResult = await analyzeComplaint(title, description, issues);

    // AI Safety Check
    if (aiResult && aiResult.isInappropriate) {
      return res.status(400).json({ 
        success: false, 
        isWarning: true,
        message: `STRICT WARNING: Your complaint has been flagged as inappropriate/vulgar. Reason: ${aiResult.safetyReason}. This incident may be reported to college administration. Please maintain decorum while using this platform.` 
      });
    }

    // Simplified routing model:
    // Lab complaints always go to Lab Management.
    // Every non-lab complaint goes to Infrastructure.
    let finalCategories = locationType === 'Lab' ? ['Lab Management'] : ['Infrastructure'];

    const formatPriority = (p) => {
        if (!p) return 'Low';
        const str = p.toString().toLowerCase();
        if (str.includes('urgent')) return 'Urgent';
        if (str.includes('high')) return 'High';
        if (str.includes('medium')) return 'Medium';
        return 'Low';
    };
    const finalPriority = formatPriority(aiResult && aiResult.priority);
    
    // Fetch all authorities
    const authorities = await User.find({ role: 'authority' });
    let assignedAdmins = [];
    let assignmentReason = '';

    if (authorities.length > 0) {
      const isFloorMatch = (admin, fl) => {
        if (!admin.floors) return false;
        return admin.floors.some(af => af === fl || (af.match(/\d+/) && af.match(/\d+/)[0] === fl));
      };

      // Strategy 1: Perfect Match (Floor + Any Matching Category)
      let matches = authorities.filter(a => isFloorMatch(a, floor) && a.responsibilities && finalCategories.some(cat => a.responsibilities.includes(cat)));
      
      if (matches.length > 0) {
        assignedAdmins = matches.map(m => m._id);
        assignmentReason = `Matched ${matches.length} admin(s) for overlapping categories ${JSON.stringify(finalCategories)} on ${floor}.`;
      } else {
        // Strategy 2: Category Match (Any floor)
        matches = authorities.filter(a => a.responsibilities && finalCategories.some(cat => a.responsibilities.includes(cat)));
        if (matches.length > 0) {
          assignedAdmins = matches.map(m => m._id);
          assignmentReason = `Fallback: No admin on ${floor}. Routed to ${matches.length} admin(s) handling ${JSON.stringify(finalCategories)}.`;
        } else {
          // Strategy 3: Floor Match (Any category)
          matches = authorities.filter(a => isFloorMatch(a, floor));
          if (matches.length > 0) {
            assignedAdmins = matches.map(m => m._id);
            assignmentReason = `Fallback: No domain match. Routed to ${matches.length} admin(s) on ${floor}.`;
          } else {
            // Strategy 4: Universal Broadcast
            assignedAdmins = authorities.map(m => m._id);
            assignmentReason = `System broadcast: No exact match found. Routed to all ${authorities.length} admins.`;
          }
        }
      }
    } else {
      assignmentReason = "No authority accounts currently exist in the system.";
    }

    const complaint = await Complaint.create({
      title,
      description,
      categories: finalCategories,
      priority: finalPriority,
      aiSuggestedPriority: aiResult ? aiResult.priority : null,
      aiSuggestedCategory: aiResult ? aiResult.category : null,
      aiReason: aiResult ? aiResult.reason : null,
      aiEstimatedFixTime: aiResult ? aiResult.estimatedFixTimeHours : null,
      locationType: locationType || 'Classroom',
      issues,
      roomNumber,
      block,
      floor,
      computerNumber,
      mouseNumber,
      keyboardNumber,
      printerNumber,
      photos,
      submittedBy: req.user.id,
      assignedAdmins,
      assignmentReason
    });

    const io = req.app.get('socketio');
    if (io) io.emit('complaint_update', { action: 'create', block: complaint.block });

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
      query.submittedBy = req.user._id;
    } else if (req.user.role === 'maintainer') {
      // Maintainers should only see explicitly assigned workloads and history
      query.assignedMaintainer = req.user._id;
    } else if (req.user.role === 'authority') {
      const admin = await User.findById(req.user.id);
      query.categories = { $in: admin.responsibilities };
      query.block = admin.block;
      if (admin.floors && admin.floors.length > 0) {
        const floorVariations = [];
        admin.floors.forEach(f => {
          floorVariations.push(f);
          const match = f.match(/\d+/);
          if (match) floorVariations.push(match[0]);
        });
        query.floor = { $in: floorVariations };
      }
    }
    
    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email collegeId')
      .populate('assignedMaintainer', 'name email jobType')
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
      .populate('assignedMaintainer', 'name email jobType phone');

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
    const { assignedMaintainer, deadline, internalNote } = req.body;
    
    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    const maintainer = await User.findById(assignedMaintainer);
    if (!maintainer || maintainer.role !== 'maintainer') return res.status(404).json({ success: false, error: 'Maintainer not found' });

    complaint.assignedMaintainer = maintainer._id;
    complaint.deadline = deadline;
    complaint.status = 'Assigned';
    if(internalNote) complaint.resolutionNote = internalNote;
    
    await complaint.save();

    // Socket io alert later
    const io = req.app.get('socketio');
    if (io) io.emit('complaint_update', { action: 'assign' });
    
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
    const { status, resolutionNote } = req.body;
    let complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ success: false, error: 'Not found' });

    complaint.status = status;
    if (resolutionNote) complaint.resolutionNote = resolutionNote;
    if (status === 'Rejected') {
      complaint.resolvedAt = Date.now();
    }
    
    await complaint.save();
    
    const io = req.app.get('socketio');
    if (io) io.emit('complaint_update', { action: 'status' });

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
    let completionPhoto = req.file ? `/uploads/${req.file.filename}` : null;
    
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

    const io = req.app.get('socketio');
    if (io) io.emit('complaint_update', { action: 'resolve' });

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
    
    if (complaint.assignedMaintainer) {
      const maintainer = await User.findById(complaint.assignedMaintainer);
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
