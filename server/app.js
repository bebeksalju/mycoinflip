/**
 * Phusion Passenger (cPanel) Entry Point
 * 
 * cPanel's "Setup Node.js App" uses Phusion Passenger which expects
 * an app.js file that exports the Express app or creates a server.
 * Passenger manages the port automatically via passenger, so we
 * don't call server.listen() here.
 */
const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const MarketService = require('./src/services/marketService');
const ChatService = require('./src/services/chatService');
const path = require('path');

// Serve Vue frontend static files from dist/ folder
app.use(require('express').static(path.join(__dirname, '../dist')));

// SPA fallback - serve index.html for all non-API routes
app.get(/^\/(?!api|uploads|health|users|socket\.io).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Start Market Service
const marketService = new MarketService(io);
marketService.connect();

// Start Chat Service
const chatService = new ChatService(io);

// For Passenger: listen on the port Passenger provides, or fallback
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
