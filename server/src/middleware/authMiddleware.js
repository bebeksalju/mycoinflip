const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        req.user = decoded;

        // Check if user is banned (lazy check - non-blocking on DB failure)
        try {
            const prisma = require('../db');
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { status: true }
            });

            if (user?.status === 'banned') {
                return res.status(403).json({ 
                    error: 'Account suspended',
                    banned: true 
                });
            }
        } catch (dbError) {
            // DB error should NOT block the request - just log and continue
            console.error('Ban check failed (non-critical):', dbError.message);
        }

        next();
    });
};

module.exports = { authenticateToken };
