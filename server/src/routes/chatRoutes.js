const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getMyMessages, getConversations, getUserMessages } = require('../controllers/chatController');

// User: get own chat history
router.get('/messages', authenticateToken, getMyMessages);

// Admin: list all conversations
router.get('/conversations', authenticateToken, getConversations);

// Admin: get messages for a specific user
router.get('/messages/:userId', authenticateToken, getUserMessages);

module.exports = router;
