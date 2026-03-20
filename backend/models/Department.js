const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  headUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  maintainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Department', DepartmentSchema);
