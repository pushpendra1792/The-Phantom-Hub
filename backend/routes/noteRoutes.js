const express = require('express');
const router = express.Router();
const { getNotes, getNotesByHackathon, createNote, updateNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getNotes)
  .post(protect, createNote);

router.get('/hackathon/:hackathonId', protect, getNotesByHackathon);

router.route('/:id')
  .put(protect, updateNote)
  .delete(protect, deleteNote);

module.exports = router;
