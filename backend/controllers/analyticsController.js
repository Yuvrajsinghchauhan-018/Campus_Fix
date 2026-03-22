const Complaint = require('../models/Complaint');
const QRNode = require('../models/QRNode');
const User = require('../models/User');

const buildAdminQuery = async (req) => {
  let query = {};
  if (req.user && req.user.role === 'authority') {
    const admin = await User.findById(req.user.id);
    if(admin) {
       query.categories = { $in: admin.responsibilities };
       query.block = admin.block;
       if (admin.floors && admin.floors.length > 0) {
         query.floor = { $in: admin.floors };
       }
    }
  }
  return query;
};

exports.getSummary = async (req, res) => {
  try {
    const query = await buildAdminQuery(req);

    const total = await Complaint.countDocuments(query);
    const resolved = await Complaint.countDocuments({ ...query, status: 'Resolved' });
    const pending = await Complaint.countDocuments({ ...query, status: 'Pending' });
    
    let avgResolutionTimeHours = 0;
    const resolvedComplaints = await Complaint.find({ ...query, status: 'Resolved' });
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
    const query = await buildAdminQuery(req);
    const data = await Complaint.aggregate([
      { $match: query },
      { $unwind: "$categories" },
      { $group: { _id: '$categories', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getByBlock = async (req, res) => {
  try {
    const query = await buildAdminQuery(req);
    const data = await Complaint.aggregate([
      { $match: query },
      { $group: { _id: '$block', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getByDepartment = async (req, res) => {
  try {
    const query = await buildAdminQuery(req);
    const data = await Complaint.aggregate([
       { $match: query },
       { $group: { _id: '$department', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } } } }
    ]);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMonthlyTrend = async (req, res) => {
  try {
    const query = await buildAdminQuery(req);
    const data = await Complaint.aggregate([
      { $match: query },
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
    const query = await buildAdminQuery(req);
    const total = await Complaint.countDocuments(query);
    const resolved = await Complaint.countDocuments({ ...query, status: 'Resolved' });
    const pending = await Complaint.countDocuments({ ...query, status: 'Pending' });
    const reportData = {
      total,
      resolvedPercentage: total > 0 ? (resolved / total) * 100 : 0,
      pendingCount: pending,
      avgResolutionTime: 0 // Mocked here
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
    let existingNode = await QRNode.findOne({ roomNumber, block, floor });
    if (existingNode) return res.status(200).json({ success: true, data: existingNode });

    const qrImage = await generateQR(roomNumber, block, floor);
    const newNode = await QRNode.create({
       roomNumber,
       block,
       floor,
       qrCodeDataUrl: qrImage
    });

    res.status(200).json({ success: true, data: newNode });
  } catch(error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
