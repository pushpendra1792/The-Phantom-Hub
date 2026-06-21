const Note = require('../models/Note');

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('createdBy', 'name')
      .populate('hackathon', 'name');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotesByHackathon = async (req, res) => {
  try {
    const notes = await Note.find({ hackathon: req.params.hackathonId })
      .populate('createdBy', 'name')
      .populate('hackathon', 'name');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createNote = async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes, getNotesByHackathon, createNote, updateNote, deleteNote };
