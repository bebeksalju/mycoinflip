const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');

const http = require('http');
const { Server } = require('socket.io');
const MarketService = require('./services/marketService');
const ChatService = require('./services/chatService');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for dev
    methods: ["GET", "POST"]
  }
});

// Start Market Service
const marketService = new MarketService(io);
marketService.connect();

// Start Chat Service
const chatService = new ChatService(io);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
