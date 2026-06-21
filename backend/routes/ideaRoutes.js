const express = require('express');
const router = express.Router();
const { getIdeas, createIdea, updateIdea, deleteIdea, voteIdea, selectIdea, addComment } = require('../controllers/ideaController');
const { protect } = require('../middleware/auth');

router.route('/:hackathonId')
  .get(protect, getIdeas)
  .post(protect, createIdea);

router.route('/:id')
  .put(protect, updateIdea)
  .delete(protect, deleteIdea);

router.post('/:id/vote', protect, voteIdea);
router.post('/:id/select', protect, selectIdea);
router.post('/:id/comments', protect, addComment);

module.exports = router;
