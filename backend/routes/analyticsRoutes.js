const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics, getTeamActivity } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardStats);
router.get('/data', protect, getAnalytics);
router.get('/team-activity', protect, getTeamActivity);

module.exports = router;
