const { v4: uuidv4 } = require('uuid');
const { createRoom, assignRoles, getGameStats } = require('../utils/gameLogic');

// ── Helpers ──────────────────────────────────────────────────────────────────

function playerListForHost(room) {
  return room.players.map(p => ({
    id: p.id, name: p.name,
    isHost: false,
    role: p.role,
    eliminated: p.eliminated,
    shielded: p.shielded,
  }));
}

function playerListForAll(room) {
  return room.players.map(p => ({
    id: p.id, name: p.name,
    isHost: false,
    role: null,
    eliminated: p.eliminated,
    shielded: p.shielded,
  }));
}

// ── Registration ─────────────────────────────────────────────────────────────

module.exports = function registerGameEvents(io, rooms, gracePeriodTimers) {

  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    // ── Disconnect with grace period ────────────────────────────────────────
    socket.on('kickPlayer', (data) => {
      const { roomCode, playerId } = data;
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;

      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        // Notify the player they've been kicked
        io.to(player.id).emit('roomClosed', { message: 'You have been removed from the room' });
        
        // Remove from list
        room.players.splice(playerIndex, 1);
        room.updatedAt = new Date();
        
        // Broadcast updated list
        io.to(roomCode).emit('playerListUpdate', room.players);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);

      rooms.forEach((room, roomCode) => {
        // Player disconnect
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
          const key = `player:${player.userId}`;
          clearTimeout(gracePeriodTimers.get(key));

          gracePeriodTimers.set(key, setTimeout(() => {
            gracePeriodTimers.delete(key);
            const idx = room.players.findIndex(p => p.userId === player.userId);
            if (idx !== -1) {
              room.players.splice(idx, 1);
              io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
            }
          }, 30 * 60 * 1000)); // 30 minute grace period
        }

        // Host disconnect
        if (room.hostId === socket.id) {
          const key = `host:${room.hostUserId}`;
          clearTimeout(gracePeriodTimers.get(key));

          gracePeriodTimers.set(key, setTimeout(() => {
            gracePeriodTimers.delete(key);
            if (room.hostId === socket.id) { // still the old socket → never reconnected
              rooms.delete(roomCode);
              io.to(roomCode).emit('roomClosed', { reason: 'Host disconnected' });
            }
          }, 30 * 60 * 1000)); // 30 minute grace period
        }
      });
    });

    // ── Rejoin session after reconnect / refresh ────────────────────────────
    socket.on('rejoinSession', ({ userId, roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('sessionExpired', { reason: 'Room no longer exists' });
        return;
      }

      // Cancel grace period timers for this userId
      const playerKey = `player:${userId}`;
      const hostKey   = `host:${userId}`;
      clearTimeout(gracePeriodTimers.get(playerKey)); gracePeriodTimers.delete(playerKey);
      clearTimeout(gracePeriodTimers.get(hostKey));   gracePeriodTimers.delete(hostKey);

      // Host reconnecting
      if (room.hostUserId === userId) {
        room.hostId = socket.id;
        socket.join(roomCode);

        socket.emit('sessionRestored', {
          roomCode,
          isHost:        true,
          gameStarted:   room.gameStarted,
          players:       playerListForHost(room),
          configuration: room.configuration,
        });
        console.log(`Host restored: room ${roomCode}`);
        return;
      }

      // Player reconnecting
      const player = room.players.find(p => p.userId === userId);
      if (player) {
        player.socketId = socket.id;
        socket.join(roomCode);

        socket.emit('sessionRestored', {
          roomCode,
          playerId:      player.id,
          isHost:        false,
          gameStarted:   room.gameStarted,
          myRole:        player.role,
          players:       playerListForAll(room),
          configuration: room.configuration,
        });
        console.log(`Player restored: ${player.name} in room ${roomCode}`);
        return;
      }

      socket.emit('sessionExpired', { reason: 'Session not found' });
    });

    // ── Create room ─────────────────────────────────────────────────────────
    socket.on('createRoom', ({ hostName, userId }) => {
      if (!hostName?.trim()) {
        socket.emit('error', { message: 'Host name is required' });
        return;
      }
      const room = createRoom(socket.id, hostName, userId);
      rooms.set(room.code, room);
      socket.join(room.code);
      socket.emit('roomCreated', { roomCode: room.code, isHost: true });
      console.log(`Room created: ${room.code} by ${hostName}`);
    });

    // ── Join room ───────────────────────────────────────────────────────────
    socket.on('joinRoom', ({ roomCode, playerName, userId }) => {
      if (!roomCode || !playerName) {
        socket.emit('error', { message: 'Room code and player name required' });
        return;
      }
      const room = rooms.get(roomCode);
      if (!room)            { socket.emit('error', { message: 'Room not found' });      return; }
      if (room.gameStarted) { socket.emit('error', { message: 'Game already started' }); return; }

      const newPlayer = {
        id:         uuidv4(),
        userId:     userId || uuidv4(),
        socketId:   socket.id,
        name:       playerName,
        role:       null,
        eliminated: false,
        shielded:   false,
      };

      room.players.push(newPlayer);
      room.updatedAt = new Date();
      socket.join(roomCode);

      socket.emit('roomJoined', { roomCode, playerId: newPlayer.id, isHost: false });
      io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
      console.log(`${playerName} joined room ${roomCode}`);
    });

    // ── Update configuration (host only) ────────────────────────────────────
    socket.on('updateConfiguration', ({ roomCode, mafiaCount, doctorCount }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }

      const total = room.players.length;
      if (mafiaCount + doctorCount > total) {
        socket.emit('error', { message: 'Role count exceeds player count' }); return;
      }

      room.configuration.mafiaCount  = Number(mafiaCount);
      room.configuration.doctorCount = Number(doctorCount);

      io.to(roomCode).emit('configurationUpdated', {
        mafiaCount, doctorCount,
        civilianCount: total - mafiaCount - doctorCount,
        totalPlayers: total,
      });
    });

    // ── Start game (host only) ──────────────────────────────────────────────
    socket.on('startGame', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }
      if (room.players.length < 2)            { socket.emit('error', { message: 'Need at least 2 players' }); return; }

      room.players = assignRoles(room);
      room.gameStarted = true;

      // Send each player their role privately via their own socket
      room.players.forEach(player => {
        const ps = io.sockets.sockets.get(player.socketId);
        if (ps) ps.emit('roleDealt', { role: player.role, playerId: player.id });
      });

      io.to(roomCode).emit('gameStarted', {
        totalPlayers: room.players.length,
        stats: getGameStats(room.players),
      });

      // Host sees full list with roles; everyone else sees anonymised list
      io.to(room.hostId).emit('playerListUpdate', playerListForHost(room));
      socket.to(roomCode).emit('playerListUpdate', playerListForAll(room));

      console.log(`Game started in room ${roomCode}`);
    });

    // ── Reveal role (1.5 s private flash) ───────────────────────────────────
    socket.on('revealRole', ({ roomCode, playerId }) => {
      const room = rooms.get(roomCode);
      if (!room) { socket.emit('error', { message: 'Room not found' }); return; }

      const player = room.players.find(p => p.id === playerId);
      if (!player) { socket.emit('error', { message: 'Player not found' }); return; }

      socket.emit('roleReveal', { role: player.role, duration: 1500 });
    });

    // ── Eliminate player (host only) ────────────────────────────────────────
    socket.on('eliminatePlayer', ({ roomCode, playerId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }

      const player = room.players.find(p => p.id === playerId);
      if (!player) { socket.emit('error', { message: 'Player not found' }); return; }

      player.eliminated = true;
      room.updatedAt = new Date();
      io.to(roomCode).emit('playerEliminated', { playerId, stats: getGameStats(room.players) });
    });

    // ── Shield player (host only) ───────────────────────────────────────────
    socket.on('shieldPlayer', ({ roomCode, playerId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }

      const player = room.players.find(p => p.id === playerId);
      if (!player) { socket.emit('error', { message: 'Player not found' }); return; }

      player.shielded = true;
      setTimeout(() => { player.shielded = false; }, 60_000);
      io.to(roomCode).emit('playerShielded', { playerId });
    });

    // ── Reveal all (host only) ──────────────────────────────────────────────
    socket.on('revealAll', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }

      io.to(roomCode).emit('allRolesRevealed', {
        players: room.players.map(p => ({ id: p.id, name: p.name, role: p.role, eliminated: p.eliminated })),
      });
    });

    // ── Reset game (host only) ──────────────────────────────────────────────
    socket.on('resetGame', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }

      room.gameStarted = false;
      room.players.forEach(p => { p.role = null; p.eliminated = false; p.shielded = false; });

      io.to(roomCode).emit('gameReset', { totalPlayers: room.players.length });
      io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
    });

    // ── Get room state ──────────────────────────────────────────────────────
    socket.on('getRoomState', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room) { socket.emit('error', { message: 'Room not found' }); return; }

      socket.emit('roomState', {
        roomCode:      room.code,
        gameStarted:   room.gameStarted,
        players:       playerListForAll(room),
        configuration: room.configuration,
        stats:         getGameStats(room.players),
      });
    });
  });
};
