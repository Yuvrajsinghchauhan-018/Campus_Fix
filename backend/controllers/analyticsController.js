const Complaint = require('../models/Complaint');

exports.getSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    
    let avgResolutionTimeHours = 0;
    const resolvedComplaints = await Complaint.find({ status: 'Resolved' });
    if (resolvedComplaints.length > 0) {
      let totalTime = 0;
      resolvedComplaints.forEach(c => {
        if(c.resolvedAt && c.createdAt) {
          totalTime += (c.resolvedAt - c.createdAt) / (1000 * 60 * 60);
        }
      });
      avgResolutionTimeHours = totalTime / resolvedComplaints.length;
    }

    res.status(200).json({
      success: true,
      data: {
        total,
        resolvedPercentage: total > 0 ? (resolved / total) * 100 : 0,
        pendingCount: pending,
        avgResolutionTime: avgResolutionTimeHours.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getByCategory = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getByBlock = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      { $group: { _id: '$block', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getByDepartment = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
       { $group: { _id: '$department', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } } } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMonthlyTrend = async (req, res) => {
  try {
    const data = await Complaint.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const { generateReport } = require('../utils/generatePDF');
exports.downloadReport = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const reportData = {
      total,
      resolvedPercentage: total > 0 ? (resolved / total) * 100 : 0,
      pendingCount: pending,
      avgResolutionTime: 0 // Mocked for simplicity here
    };
    generateReport(res, reportData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const { generateQR } = require('../utils/qrGenerator');
exports.createQR = async (req, res) => {
  try {
    const { roomNumber, block, floor } = req.body;
    const qrImage = await generateQR(roomNumber, block, floor);
    res.status(200).json({ success: true, data: qrImage });
  } catch(error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
