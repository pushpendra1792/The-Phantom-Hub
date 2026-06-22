const Task = require('../models/Task');
const { syncTaskEvents, removeTaskEvents } = require('../utils/calendarSync');

const getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.hackathon) filter.hackathon = req.query.hackathon;
    if (req.query.assignee) filter.assignee = req.query.assignee;
    if (req.query.status) filter.status = req.query.status;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email')
      .sort({ order: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email')
      .populate('comments.user', 'name email')
      .populate('attachments.uploadedBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id,
    });
    await syncTaskEvents(task);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await syncTaskEvents(task);
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = req.body.status || task.status;
    task.order = req.body.order !== undefined ? req.body.order : task.order;
    const updated = await task.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await removeTaskEvents(task._id);
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTaskComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      user: req.user._id,
      text: req.body.text,
    });

    const updated = await task.save();

    const populated = await Task.findById(updated._id)
      .populate('comments.user', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTaskAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    task.attachments.push({
      filename: req.file.originalname,
      url: req.file.path,
      uploadedBy: req.user._id,
    });

    const updated = await task.save();

    const populated = await Task.findById(updated._id)
      .populate('attachments.uploadedBy', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, updateTaskStatus, deleteTask, addTaskComment, addTaskAttachment };
