const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'ppt', 'documentation', 'research', 'ui', 'image', 'zip', 'other'],
    default: 'other',
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Resource', resourceSchema);
