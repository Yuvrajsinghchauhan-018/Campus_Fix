const mongoose = require('mongoose');

const qrNodeSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  block: {
    type: String,
    required: true
  },
  floor: {
    type: String,
    required: true
  },
  qrCodeDataUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QRNode', qrNodeSchema);
