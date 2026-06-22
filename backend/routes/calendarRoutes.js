const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent, syncAllEvents } = require('../controllers/calendarController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

router.post('/sync', protect, syncAllEvents);

router.route('/:id')
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

module.exports = router;
