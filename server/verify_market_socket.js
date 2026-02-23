const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

console.log("Connecting to backend...");

socket.on("connect", () => {
  console.log("Connected to Backend Socket.io");
});

socket.on("market:update", (data) => {
  console.log("Received Market Update:", data.s, data.p);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err.message);
  process.exit(1);
});

// Timeout
setTimeout(() => {
    console.error("Timeout waiting for market data");
    process.exit(1);
}, 10000);
