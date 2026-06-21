const express = require('express');
const router = express.Router();
const { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, addTaskComment, addTaskAttachment } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.patch('/:id/status', protect, updateTaskStatus);
router.post('/:id/comments', protect, addTaskComment);
router.post('/:id/attachments', protect, upload.single('file'), addTaskAttachment);

module.exports = router;
