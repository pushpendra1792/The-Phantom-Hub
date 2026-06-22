const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  registrationDeadline: Date,
  startDate: Date,
  endDate: Date,
  submissionDeadline: Date,
  theme: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['planning', 'registered', 'building', 'submitted', 'completed', 'won'],
    default: 'planning',
  },
  githubRepo: {
    type: String,
    default: '',
  },
  figmaLink: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  selectedIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    default: null,
  },
  rounds: [{
    name: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: '' },
  }],
  meetings: [{
    title: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
