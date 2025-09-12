const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { to, encryptedContent, messageType = 'text' } = req.body;

    const message = new Message({
      from: req.user.username,
      to,
      encryptedContent,
      messageType
    });

    await message.save();

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/conversation/:username', auth, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUser = req.user.username;

    const messages = await Message.find({
      $or: [
        { from: currentUser, to: username },
        { from: username, to: currentUser }
      ]
    }).sort({ createdAt: 1 }).limit(100);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for a user
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUser = req.user.username;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ from: currentUser }, { to: currentUser }]
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$from', currentUser] },
              then: '$to',
              else: '$from'
            }
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;