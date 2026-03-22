const User = require('../models/User');

exports.createMaintainer = async (req, res) => {
  try {
    const { name, phone, jobType } = req.body;
    if (!name || !phone || !jobType) {
      return res.status(400).json({ success: false, error: 'Name, phone, and type are required' });
    }

    const exist = await User.findOne({ phone, role: 'maintainer' });
    if (exist) return res.status(400).json({ success: false, error: 'Maintainer with this phone already exists' });

    const maintainer = await User.create({
      name,
      phone,
      jobType,
      role: 'maintainer',
      isApproved: true,
      approvalStatus: 'Approved',
      createdBy: req.user.id
    });

    const io = req.app.get('socketio');
    if (io) io.emit('maintainer_update');

    res.status(201).json({ success: true, data: maintainer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPendingMaintainers = async (req, res) => {
  try {
    const maintainers = await User.find({ role: 'maintainer', approvalStatus: { $in: ['pending', 'Pending'] } }).select('-password');
    res.status(200).json({ success: true, data: maintainers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.approveMaintainer = async (req, res) => {
  try {
    const maintainer = await User.findById(req.params.id);
    if (!maintainer || maintainer.role !== 'maintainer') return res.status(404).json({ success: false, error: 'Maintainer not found' });

    maintainer.isApproved = true;
    maintainer.approvalStatus = 'Approved';
    await maintainer.save();
    
    const io = req.app.get('socketio');
    if (io) io.emit('maintainer_update');

    res.status(200).json({ success: true, data: maintainer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rejectMaintainer = async (req, res) => {
  try {
    const maintainer = await User.findById(req.params.id);
    if (!maintainer || maintainer.role !== 'maintainer') return res.status(404).json({ success: false, error: 'Maintainer not found' });

    maintainer.isApproved = false;
    maintainer.approvalStatus = 'Rejected';
    await maintainer.save();
    
    const io = req.app.get('socketio');
    if (io) io.emit('maintainer_update');

    res.status(200).json({ success: true, data: maintainer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getApprovedMaintainers = async (req, res) => {
  try {
    const maintainers = await User.find({ role: 'maintainer', approvalStatus: { $in: ['approved', 'Approved'] } }).select('-password');
    res.status(200).json({ success: true, data: maintainers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
