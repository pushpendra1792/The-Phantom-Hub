const express = require('express');
const router = express.Router();
const { getTeamMembers, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/team', protect, getTeamMembers);
router.get('/:id', protect, getUserProfile);

module.exports = router;
