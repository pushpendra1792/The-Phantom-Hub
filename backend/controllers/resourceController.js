const Resource = require('../models/Resource');
const fs = require('fs');

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'name')
      .populate('hackathon', 'name');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getResourcesByHackathon = async (req, res) => {
  try {
    const resources = await Resource.find({ hackathon: req.params.hackathonId })
      .populate('uploadedBy', 'name')
      .populate('hackathon', 'name');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resource = await Resource.create({
      hackathon: req.body.hackathon || null,
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'other',
      fileUrl: req.file.path,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      description: req.body.description || '',
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (fs.existsSync(resource.fileUrl)) {
      fs.unlinkSync(resource.fileUrl);
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resource removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getResources, getResourcesByHackathon, uploadResource, deleteResource };
