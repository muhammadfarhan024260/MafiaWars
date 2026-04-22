const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active rooms and their state
const rooms = new Map();

// Import event handlers
const registerGameEvents = require('./events/gameEvents');
registerGameEvents(io, rooms);

// Health check and versioning
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.1', 
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/version', (req, res) => {
  res.json({ version: '1.0.1-shuffling-fix-v2' });
});

// Get room info (for debugging)
app.get('/api/rooms/:roomCode', (req, res) => {
  const room = rooms.get(req.params.roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  const safeRoom = {
    code: room.code,
    playerCount: room.players.length,
    gameStarted: room.gameStarted,
    hostId: room.hostId,
    isHost: req.query.userId === room.hostId
  };
  res.json(safeRoom);
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Cleanup: remove player from any rooms
    rooms.forEach((room, roomCode) => {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(roomCode).emit('playerListUpdate', room.players.map(p => ({
          id: p.id,
          name: p.name,
          isHost: p.id === room.hostId
        })));
        
        // If host disconnects, end the room
        if (room.hostId === socket.id) {
          rooms.delete(roomCode);
          io.to(roomCode).emit('roomClosed', { reason: 'Host disconnected' });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
