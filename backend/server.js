const express = require('express');
const http    = require('http');
const socketIo = require('socket.io');
const cors    = require('cors');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const rooms              = new Map();
const gracePeriodTimers  = new Map();

const registerGameEvents = require('./events/gameEvents');
registerGameEvents(io, rooms, gracePeriodTimers);

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.1.0', timestamp: new Date().toISOString() }));

app.get('/api/rooms/:roomCode', (req, res) => {
  const room = rooms.get(req.params.roomCode);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({
    code:        room.code,
    playerCount: room.players.length,
    gameStarted: room.gameStarted,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
