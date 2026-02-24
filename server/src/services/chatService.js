const jwt = require('jsonwebtoken');
const prisma = require('../db');

class ChatService {
    constructor(io) {
        this.io = io;
        this.chatNs = io.of('/chat');
        this.setupSocketAuth();
        this.setupEventHandlers();
    }

    setupSocketAuth() {
        this.chatNs.use((socket, next) => {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error('Authentication required'));

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = decoded.userId;
                socket.userRole = decoded.role;
                next();
            } catch (err) {
                next(new Error('Invalid token'));
            }
        });
    }

    setupEventHandlers() {
        this.chatNs.on('connection', (socket) => {
            const userId = socket.userId;
            const role = socket.userRole;
            const isAdmin = role === 'ADMIN' || role === 'SUPERUSER';

            console.log(`Chat connected: user ${userId} (${role})`);

            // Every socket joins their own user room (for multi-tab support)
            socket.join(`user:${userId}`);

            // Admins also join the admin room
            if (isAdmin) {
                socket.join('admin');
            }

            // --- USER sends a message ---
            socket.on('chat:send', async (data) => {
                if (!data?.message?.trim()) return;
                try {
                    const msg = await prisma.chatMessage.create({
                        data: {
                            userId: userId,
                            sender: 'user',
                            message: data.message.trim()
                        },
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    });

                    const payload = this._formatMessage(msg);

                    // Broadcast to ALL sockets of this user (multi-tab) via room
                    this.chatNs.to(`user:${userId}`).emit('chat:receive', payload);
                    // Notify all admins
                    this.chatNs.to('admin').emit('chat:receive', payload);
                    this.chatNs.to('admin').emit('chat:new-message', {
                        userId: msg.userId,
                        user: msg.user,
                        lastMessage: msg.message,
                        createdAt: msg.createdAt
                    });
                } catch (error) {
                    console.error('Chat send error:', error);
                    socket.emit('chat:error', { message: 'Failed to send message' });
                }
            });

            // --- ADMIN sends a reply ---
            socket.on('chat:admin:send', async (data) => {
                if (!isAdmin) return socket.emit('chat:error', { message: 'Unauthorized' });
                if (!data?.userId || !data?.message?.trim()) return;

                try {
                    const msg = await prisma.chatMessage.create({
                        data: {
                            userId: data.userId,
                            sender: 'admin',
                            message: data.message.trim()
                        },
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    });

                    const payload = this._formatMessage(msg);

                    // Send to the target user (all their tabs)
                    this.chatNs.to(`user:${data.userId}`).emit('chat:receive', payload);
                    // Send to all admins (all their tabs)
                    this.chatNs.to('admin').emit('chat:receive', payload);
                } catch (error) {
                    console.error('Admin chat send error:', error);
                    socket.emit('chat:error', { message: 'Failed to send message' });
                }
            });

            // --- Mark messages as read ---
            socket.on('chat:read', async (data) => {
                try {
                    if (isAdmin && data?.userId) {
                        await prisma.chatMessage.updateMany({
                            where: { userId: data.userId, sender: 'user', read: false },
                            data: { read: true }
                        });
                        this.chatNs.to(`user:${data.userId}`).emit('chat:messages-read');
                    } else if (!isAdmin) {
                        await prisma.chatMessage.updateMany({
                            where: { userId, sender: 'admin', read: false },
                            data: { read: true }
                        });
                        this.chatNs.to('admin').emit('chat:messages-read', { userId });
                    }
                } catch (error) {
                    console.error('Chat read error:', error);
                }
            });

            // --- Typing indicator ---
            socket.on('chat:typing', (data) => {
                if (isAdmin && data?.userId) {
                    this.chatNs.to(`user:${data.userId}`).emit('chat:typing', { sender: 'admin' });
                } else if (!isAdmin) {
                    this.chatNs.to('admin').emit('chat:typing', { userId, sender: 'user' });
                }
            });

            socket.on('disconnect', () => {
                console.log(`Chat disconnected: user ${userId}`);
            });
        });
    }

    _formatMessage(msg) {
        return {
            id: msg.id,
            userId: msg.userId,
            sender: msg.sender,
            message: msg.message,
            read: msg.read,
            createdAt: msg.createdAt,
            user: msg.user
        };
    }
}

module.exports = ChatService;
