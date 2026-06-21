const express = require('express');
const router = express.Router();
const { getResources, getResourcesByHackathon, uploadResource, deleteResource } = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getResources)
  .post(protect, upload.single('file'), uploadResource);

router.get('/hackathon/:hackathonId', protect, getResourcesByHackathon);
router.delete('/:id', protect, deleteResource);

module.exports = router;
