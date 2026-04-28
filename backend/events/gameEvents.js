const { v4: uuidv4 } = require('uuid');
const { createRoom, assignRoles, getGameStats, checkWinCondition, resolveNightActions, resolveDayVotes } = require('../utils/gameLogic');

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
        const kickedSocket = io.sockets.sockets.get(player.socketId);
        if (kickedSocket) kickedSocket.emit('roomClosed', { message: 'You have been removed from the room' });
        
        // Remove from list
        room.players.splice(playerIndex, 1);
        room.updatedAt = new Date();
        
        // Broadcast updated list
        io.to(roomCode).emit('playerListUpdate', room.players);
      }
    });

    // ── Leave Room / Disconnect Logic ──────────────────────────────────────
    const handleUserLeave = (roomCode, socketId, userId, isExplicit = false) => {
      const room = rooms.get(roomCode);
      if (!room) return;

      const isHost = room.hostUserId === userId;

      if (isHost) {
        if (isExplicit) {
          // Host explicitly left. Migrate immediately if possible.
          if (room.players.length > 0) {
            const nextInLine = room.players.shift();
            room.hostId = nextInLine.socketId;
            room.hostUserId = nextInLine.userId;
            room.hostName = nextInLine.name;
            console.log(`Host migrated in ${roomCode}: New Host is ${room.hostName}`);
            
            io.to(roomCode).emit('error', { message: `Narrator left. ${room.hostName} is now the host.` });
            io.to(room.hostId).emit('sessionRestored', { roomCode, isHost: true, players: playerListForHost(room) });
            io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
          } else {
            rooms.delete(roomCode);
          }
        } else {
          // Host disconnected (accidental). Start grace period timer.
          const key = `host:${userId}`;
          clearTimeout(gracePeriodTimers.get(key));
          gracePeriodTimers.set(key, setTimeout(() => {
            gracePeriodTimers.delete(key);
            handleUserLeave(roomCode, socketId, userId, true);
          }, 30 * 60 * 1000));
        }
      } else {
        // Player left
        const pIndex = room.players.findIndex(p => p.userId === userId);
        if (pIndex !== -1) {
          if (isExplicit) {
            room.players.splice(pIndex, 1);
            io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
          } else {
            const key = `player:${userId}`;
            clearTimeout(gracePeriodTimers.get(key));
            gracePeriodTimers.set(key, setTimeout(() => {
              gracePeriodTimers.delete(key);
              handleUserLeave(roomCode, socketId, userId, true);
            }, 30 * 60 * 1000));
          }
        }
      }
    };

    socket.on('leaveRoom', ({ roomCode, userId }) => {
      handleUserLeave(roomCode, socket.id, userId, true);
      socket.leave(roomCode);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
      rooms.forEach((room, roomCode) => {
        if (room.hostId === socket.id) {
          handleUserLeave(roomCode, socket.id, room.hostUserId, false);
        } else {
          const p = room.players.find(p => p.socketId === socket.id);
          if (p) handleUserLeave(roomCode, socket.id, p.userId, false);
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
    socket.on('updateConfiguration', ({ roomCode, mafiaCount, doctorCount, customRoles }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }

      const total = room.players.length;
      const sanitizedCustom = (customRoles || []).map(r => ({ name: String(r.name).toUpperCase(), count: Number(r.count), color: String(r.color || '#888888') }));
      const customTotal = sanitizedCustom.reduce((s, r) => s + r.count, 0);

      if (mafiaCount + doctorCount + customTotal > total) {
        socket.emit('error', { message: 'Role count exceeds player count' }); return;
      }

      room.configuration.mafiaCount  = Number(mafiaCount);
      room.configuration.doctorCount = Number(doctorCount);
      room.configuration.customRoles = sanitizedCustom;

      io.to(roomCode).emit('configurationUpdated', {
        mafiaCount, doctorCount, customRoles: sanitizedCustom,
        civilianCount: total - mafiaCount - doctorCount - customTotal,
        totalPlayers: total,
      });
    });

    // ── Start game (host only) ──────────────────────────────────────────────
    socket.on('startGame', ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }

      if (room.gameMode === 'automatic') {
        // In auto mode host becomes a player — need at least 2 players (+ host = 3 total)
        if (room.players.length < 2) { socket.emit('error', { message: 'Need at least 2 players (plus you as host)' }); return; }

        // Add host as a player if not already in list
        const hostAlreadyPlayer = room.players.some(p => p.userId === room.hostUserId);
        if (!hostAlreadyPlayer) {
          room.players.push({
            id:         uuidv4(),
            userId:     room.hostUserId,
            socketId:   room.hostId,
            name:       room.hostName,
            role:       null,
            eliminated: false,
            shielded:   false,
          });
        }
      } else {
        if (room.players.length < 2) { socket.emit('error', { message: 'Need at least 2 players' }); return; }
      }

      room.players = assignRoles(room);
      room.gameStarted = true;

      // Send each player their role privately
      room.players.forEach(player => {
        const ps = io.sockets.sockets.get(player.socketId);
        if (ps) {
          // In auto mode, also tell Mafia who their teammates are
          const teammates = room.gameMode === 'automatic' && player.role === 'MAFIA'
            ? room.players.filter(p => p.role === 'MAFIA' && p.id !== player.id).map(p => ({ id: p.id, name: p.name }))
            : [];
          ps.emit('roleDealt', { role: player.role, playerId: player.id, mafiaTeammates: teammates });
        }
      });

      if (room.gameMode === 'automatic') {
        io.to(roomCode).emit('gameStarted', {
          totalPlayers: room.players.length,
          stats: getGameStats(room.players),
          gameMode: 'automatic',
        });
        io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
        // Night phase starts after role reveal (give 3s for the reveal animation)
        setTimeout(() => startNightPhase(room, roomCode), 3000);
      } else {
        io.to(roomCode).emit('gameStarted', {
          totalPlayers: room.players.length,
          stats: getGameStats(room.players),
          gameMode: 'manual',
        });
        // Host sees full list with roles; everyone else sees anonymised list
        io.to(room.hostId).emit('playerListUpdate', playerListForHost(room));
        socket.to(roomCode).emit('playerListUpdate', playerListForAll(room));
      }

      console.log(`Game started in room ${roomCode} (${room.gameMode} mode)`);
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

      clearTimeout(room.phaseTimer);
      room.gameStarted = false;
      room.currentPhase = 'lobby';
      room.nightActions = { submissions: [], resolved: false };
      room.dayVotes = { votes: {}, resolved: false };

      // In auto mode, remove the host from the player list on reset
      if (room.gameMode === 'automatic') {
        room.players = room.players.filter(p => p.userId !== room.hostUserId);
      }
      room.players.forEach(p => { p.role = null; p.eliminated = false; p.shielded = false; });

      io.to(roomCode).emit('gameReset', { totalPlayers: room.players.length });
      io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
    });

    // ── Host Switch Logic ───────────────────────────────────────────────────
    socket.on('requestHostSwitch', ({ roomCode, userId }) => {
      const room = rooms.get(roomCode);
      if (!room) return;
      const player = room.players.find(p => p.userId === userId);
      if (!player) return;

      // Notify the host about the request
      io.to(room.hostId).emit('hostSwitchRequest', { 
        playerId: player.id, 
        userId: player.userId, 
        name: player.name 
      });
    });

    socket.on('acceptHostSwitch', ({ roomCode, targetUserId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) return;

      const pIdx = room.players.findIndex(p => p.userId === targetUserId);
      if (pIdx === -1) return;

      const newHostPlayer = room.players[pIdx];

      // Store current host details to turn them into a player
      const oldHost = {
        id:         uuidv4(),
        userId:     room.hostUserId,
        socketId:   room.hostId,
        name:       room.hostName,
        role:       null,
        eliminated: false,
        shielded:   false,
      };

      // Perform the swap
      room.hostId = newHostPlayer.socketId;
      room.hostUserId = newHostPlayer.userId;
      room.hostName = newHostPlayer.name;

      // Remove the new host from player list and add the old host
      room.players.splice(pIdx, 1);
      room.players.push(oldHost);

      console.log(`Host Switched: ${room.hostName} is now host, ${oldHost.name} is now player.`);

      // Notify everyone
      io.to(roomCode).emit('error', { message: `Narrator role transferred to ${room.hostName}` });
      
      // Update everyone's local state
      io.to(room.hostId).emit('roomState', { ...room, isHost: true });
      io.to(oldHost.socketId).emit('roomState', { ...room, isHost: false });
      
      io.to(roomCode).emit('playerListUpdate', playerListForAll(room));
      io.to(room.hostId).emit('playerListUpdate', playerListForHost(room));
    });

    // ── Automatic mode helpers ──────────────────────────────────────────────

    function startNightPhase(room, roomCode) {
      room.currentPhase = 'night';
      room.roundNumber += 1;
      room.nightActions = { submissions: [], resolved: false };
      io.to(roomCode).emit('phaseChanged', {
        phase: 'night',
        roundNumber: room.roundNumber,
        timerSeconds: 30,
      });

      room.phaseTimer = setTimeout(() => {
        if (room.currentPhase !== 'night' || room.nightActions.resolved) return;
        room.nightActions.resolved = true;
        const { eliminated, saved } = resolveNightActions(room);
        io.to(roomCode).emit('nightResolved', { eliminated, saved });

        const winner = checkWinCondition(room.players);
        if (winner) {
          endGame(room, roomCode, winner);
        } else {
          setTimeout(() => startDayPhase(room, roomCode), 3500);
        }
      }, 30_000);
    }

    function startDayPhase(room, roomCode) {
      room.currentPhase = 'day';
      room.dayVotes = { votes: {}, resolved: false };
      io.to(roomCode).emit('phaseChanged', {
        phase: 'day',
        roundNumber: room.roundNumber,
        timerSeconds: 120,
      });

      room.phaseTimer = setTimeout(() => {
        if (room.currentPhase !== 'day' || room.dayVotes.resolved) return;
        finalizeDay(room, roomCode);
      }, 120_000);
    }

    function finalizeDay(room, roomCode) {
      room.dayVotes.resolved = true;
      const { eliminated, tie } = resolveDayVotes(room);
      io.to(roomCode).emit('dayResolved', { eliminated, tie });

      const winner = checkWinCondition(room.players);
      if (winner) {
        endGame(room, roomCode, winner);
      } else {
        setTimeout(() => startNightPhase(room, roomCode), 3500);
      }
    }

    function endGame(room, roomCode, winner) {
      room.currentPhase = 'lobby';
      room.gameStarted = false;
      clearTimeout(room.phaseTimer);
      io.to(roomCode).emit('gameOver', {
        winner,
        players: room.players.map(p => ({ id: p.id, name: p.name, role: p.role, eliminated: p.eliminated })),
      });
    }

    // ── Toggle game mode (host only, between rounds) ────────────────────────
    socket.on('toggleGameMode', ({ roomCode, gameMode }) => {
      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) { socket.emit('error', { message: 'Unauthorized' }); return; }
      if (room.gameStarted) { socket.emit('error', { message: 'Cannot change mode mid-game' }); return; }

      room.gameMode = gameMode === 'automatic' ? 'automatic' : 'manual';
      io.to(roomCode).emit('gameModeChanged', { gameMode: room.gameMode });
    });

    // ── Submit night action (any alive player in auto mode) ─────────────────
    socket.on('submitNightAction', ({ roomCode, userId, targetId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.currentPhase !== 'night' || room.nightActions.resolved) return;

      const player = room.players.find(p => p.userId === userId);
      if (!player || player.eliminated) return;

      // Replace previous submission from same user
      room.nightActions.submissions = room.nightActions.submissions.filter(s => s.userId !== userId);
      room.nightActions.submissions.push({ userId, targetId, timestamp: Date.now() });

      // Check if all alive players have submitted
      const aliveCount = room.players.filter(p => !p.eliminated).length;
      if (room.nightActions.submissions.length >= aliveCount) {
        clearTimeout(room.phaseTimer);
        room.nightActions.resolved = true;
        const { eliminated, saved } = resolveNightActions(room);
        io.to(roomCode).emit('nightResolved', { eliminated, saved });

        const winner = checkWinCondition(room.players);
        if (winner) {
          endGame(room, roomCode, winner);
        } else {
          setTimeout(() => startDayPhase(room, roomCode), 3500);
        }
      }
    });

    // ── Submit day vote (any alive player in auto mode) ─────────────────────
    socket.on('submitDayVote', ({ roomCode, userId, targetId }) => {
      const room = rooms.get(roomCode);
      if (!room || room.currentPhase !== 'day' || room.dayVotes.resolved) return;

      const voter = room.players.find(p => p.userId === userId);
      if (!voter || voter.eliminated) return;

      room.dayVotes.votes[userId] = targetId;
      io.to(roomCode).emit('dayVoteUpdate', { votes: room.dayVotes.votes });

      // Check if all alive players have voted
      const aliveCount = room.players.filter(p => !p.eliminated).length;
      if (Object.keys(room.dayVotes.votes).length >= aliveCount) {
        clearTimeout(room.phaseTimer);
        finalizeDay(room, roomCode);
      }
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
