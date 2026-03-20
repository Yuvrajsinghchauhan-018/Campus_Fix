const User = require('../models/User');

// @desc    Get all pending maintainers
// @route   GET /api/maintainers/pending
// @access  Private/Authority
exports.getPendingMaintainers = async (req, res) => {
  try {
    const maintainers = await User.find({ role: 'maintainer', approvalStatus: 'pending' }).select('-password');
    res.status(200).json({ success: true, data: maintainers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve maintainer
// @route   PATCH /api/maintainers/:id/approve
// @access  Private/Authority
exports.approveMaintainer = async (req, res) => {
  try {
    const maintainer = await User.findById(req.params.id);
    if (!maintainer || maintainer.role !== 'maintainer') {
      return res.status(404).json({ success: false, error: 'Maintainer not found' });
    }

    maintainer.isApproved = true;
    maintainer.approvalStatus = 'approved';
    await maintainer.save();

    // TODO: Send email notification
    
    res.status(200).json({ success: true, data: maintainer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reject maintainer
// @route   PATCH /api/maintainers/:id/reject
// @access  Private/Authority
exports.rejectMaintainer = async (req, res) => {
  try {
    const maintainer = await User.findById(req.params.id);
    if (!maintainer || maintainer.role !== 'maintainer') {
      return res.status(404).json({ success: false, error: 'Maintainer not found' });
    }

    maintainer.isApproved = false;
    maintainer.approvalStatus = 'rejected';
    await maintainer.save();

    // TODO: Send email notification
    
    res.status(200).json({ success: true, data: maintainer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all approved maintainers
// @route   GET /api/maintainers
// @access  Private/Authority
exports.getApprovedMaintainers = async (req, res) => {
  try {
    const maintainers = await User.find({ role: 'maintainer', approvalStatus: 'approved' }).select('-password');
    res.status(200).json({ success: true, data: maintainers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
