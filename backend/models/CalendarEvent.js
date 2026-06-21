const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['hackathon', 'meeting', 'deadline', 'milestone', 'other'],
    default: 'other',
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  color: {
    type: String,
    default: '#a855f7',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
