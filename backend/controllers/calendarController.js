const CalendarEvent = require('../models/CalendarEvent');

const getEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.start && req.query.end) {
      filter.startDate = { $gte: new Date(req.query.start) };
      filter.endDate = { $lte: new Date(req.query.end) };
    }

    const events = await CalendarEvent.find(filter)
      .populate('hackathon', 'name color');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const syncAllEvents = async (req, res) => {
  try {
    const result = await require('../utils/calendarSync').syncAll(req.user._id);
    res.json({ message: `Synced ${result.tasks} tasks and ${result.hackathons} hackathons to calendar`, ...result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEvents, createEvent, updateEvent, deleteEvent, syncAllEvents };
