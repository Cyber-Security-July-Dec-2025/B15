const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find(
      { username: { $ne: req.user.username } },
      'username fingerprint isOnline lastSeen publicKey'
    ).sort({ username: 1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by username
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne(
      { username: req.params.username },
      'username fingerprint publicKey isOnline lastSeen'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;