const Idea = require('../models/Idea');
const Hackathon = require('../models/Hackathon');

const getIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ hackathon: req.params.hackathonId })
      .populate('votes.user', 'name email')
      .populate('comments.user', 'name email');
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createIdea = async (req, res) => {
  try {
    const { title, description, researchLinks, references, diagrams, notes } = req.body;

    const idea = await Idea.create({
      hackathon: req.params.hackathonId,
      title,
      description,
      researchLinks,
      references,
      diagrams,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findByIdAndDelete(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json({ message: 'Idea removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const voteIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const alreadyVoted = idea.votes.find(
      (vote) => vote.user.toString() === req.user._id.toString()
    );

    if (alreadyVoted) {
      idea.votes = idea.votes.filter(
        (vote) => vote.user.toString() !== req.user._id.toString()
      );
      idea.votesCount = idea.votes.length;
    } else {
      idea.votes.push({ user: req.user._id });
      idea.votesCount = idea.votes.length;
    }

    const updated = await idea.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const selectIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    idea.isSelected = true;
    await idea.save();

    await Hackathon.findByIdAndUpdate(idea.hackathon, { selectedIdea: idea._id });

    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    idea.comments.push({
      user: req.user._id,
      text: req.body.text,
    });

    const updated = await idea.save();

    const populated = await Idea.findById(updated._id)
      .populate('comments.user', 'name email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getIdeas, createIdea, updateIdea, deleteIdea, voteIdea, selectIdea, addComment };
