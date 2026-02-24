const prisma = require('../db');

// GET /api/chat/messages — User gets their own chat history
const getMyMessages = async (req, res) => {
    try {
        const messages = await prisma.chatMessage.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'asc' },
            take: 100
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/chat/conversations — Admin: list all users with chat + unread count
const getConversations = async (req, res) => {
    try {
        // Get all users who have chat messages, with their latest message and unread count
        const conversations = await prisma.$queryRaw`
            SELECT 
                u.id as "userId",
                u.name,
                u.email,
                (SELECT message FROM "ChatMessage" cm2 WHERE cm2."userId" = u.id ORDER BY cm2."createdAt" DESC LIMIT 1) as "lastMessage",
                (SELECT "createdAt" FROM "ChatMessage" cm3 WHERE cm3."userId" = u.id ORDER BY cm3."createdAt" DESC LIMIT 1) as "lastMessageAt",
                (SELECT COUNT(*)::int FROM "ChatMessage" cm4 WHERE cm4."userId" = u.id AND cm4.sender = 'user' AND cm4.read = false) as "unreadCount"
            FROM "User" u
            WHERE EXISTS (SELECT 1 FROM "ChatMessage" cm WHERE cm."userId" = u.id)
            ORDER BY "lastMessageAt" DESC
        `;
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/chat/messages/:userId — Admin: get chat history for a specific user
const getUserMessages = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const messages = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMyMessages, getConversations, getUserMessages };
