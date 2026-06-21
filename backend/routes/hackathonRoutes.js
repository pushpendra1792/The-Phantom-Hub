const express = require('express');
const router = express.Router();
const { getHackathons, getHackathon, createHackathon, updateHackathon, deleteHackathon, archiveHackathon } = require('../controllers/hackathonController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getHackathons)
  .post(protect, createHackathon);

router.route('/:id')
  .get(protect, getHackathon)
  .put(protect, updateHackathon)
  .delete(protect, deleteHackathon);

router.put('/:id/archive', protect, archiveHackathon);

module.exports = router;
