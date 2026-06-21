const User = require('../models/User');

const getTeamMembers = async (req, res) => {
  try {
    const users = await User.find().select('name email avatar skills github linkedin');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTeamMembers, getUserProfile };
