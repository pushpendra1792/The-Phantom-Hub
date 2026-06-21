const Hackathon = require('../models/Hackathon');

const getHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ isArchived: false })
      .populate('createdBy', 'name email')
      .sort({ startDate: 1 });
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate({
        path: 'ideas',
        populate: { path: 'votes.user comments.user' },
      });

    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    const tasksCount = await require('../models/Task').countDocuments({ hackathon: req.params.id });
    const resourcesCount = await require('../models/Resource').countDocuments({ hackathon: req.params.id });

    res.json({ ...hackathon.toObject(), tasksCount, resourcesCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    res.json({ message: 'Hackathon archived' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const archiveHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ message: 'Hackathon not found' });
    }

    hackathon.isArchived = !hackathon.isArchived;
    const updated = await hackathon.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHackathons, getHackathon, createHackathon, updateHackathon, deleteHackathon, archiveHackathon };
