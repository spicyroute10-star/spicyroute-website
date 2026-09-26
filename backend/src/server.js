import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { initSocket } from './sockets/socketHandler.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io with HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

initSocket(io);

server.listen(PORT, () => {
  console.log(`\n🚀 Food Delivery Backend Server running on http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server listening for real-time order updates`);
});
