const { v4: uuidv4 } = require('uuid');
const { createRoom, assignRoles, getGameStats } = require('../utils/gameLogic');

module.exports = function registerGameEvents(io, rooms) {
  io.on('connection', (socket) => {
    /**
     * Create a new room
     */
    socket.on('createRoom', (data) => {
      const { hostName } = data;
      
      if (!hostName || hostName.trim().length === 0) {
        socket.emit('error', { message: 'Host name is required' });
        return;
      }

      const room = createRoom(socket.id, hostName);
      
      rooms.set(room.code, room);
      socket.join(room.code);

      socket.emit('roomCreated', {
        roomCode: room.code,
        isHost: true
      });

      console.log(`Room created: ${room.code} by ${hostName}`);
    });

    /**
     * Join an existing room
     */
    socket.on('joinRoom', (data) => {
      const { roomCode, playerName } = data;

      if (!roomCode || !playerName) {
        socket.emit('error', { message: 'Room code and player name required' });
        return;
      }

      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.gameStarted) {
        socket.emit('error', { message: 'Game already started' });
        return;
      }

      const newPlayer = {
        id: uuidv4(),
        socketId: socket.id,
        name: playerName,
        role: null,
        eliminated: false,
        shielded: false
      };

      room.players.push(newPlayer);
      room.updatedAt = new Date();
      socket.join(roomCode);

      socket.emit('roomJoined', {
        roomCode,
        playerId: newPlayer.id,
        isHost: false
      });

      // Notify all players in room of player list update
      const playerList = room.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.id === room.hostId
      }));

      io.to(roomCode).emit('playerListUpdate', playerList);
      console.log(`${playerName} joined room ${roomCode}`);
    });

    /**
     * Update room configuration (host only)
     */
    socket.on('updateConfiguration', (data) => {
      const { roomCode, mafiaCount, doctorCount } = data;

      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const totalPlayers = room.players.length;
      if (mafiaCount + doctorCount > totalPlayers) {
        socket.emit('error', { message: 'Role count exceeds player count' });
        return;
      }

      room.configuration.mafiaCount = Number(mafiaCount);
      room.configuration.doctorCount = Number(doctorCount);

      const civilianCount = totalPlayers - mafiaCount - doctorCount;
      io.to(roomCode).emit('configurationUpdated', {
        mafiaCount,
        doctorCount,
        civilianCount,
        totalPlayers
      });
    });

    /**
     * Start game and deal roles
     */
    socket.on('startGame', (data) => {
      const { roomCode } = data;

      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      if (room.players.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }

      // Assign roles
      const updatedPlayers = assignRoles(
        room.players,
        room.configuration.mafiaCount,
        room.configuration.doctorCount
      );

      room.players = updatedPlayers;
      room.gameStarted = true;

      // Send each player their role privately
      room.players.forEach(player => {
        const playerSocket = io.sockets.sockets.get(player.socketId);
        if (playerSocket) {
          playerSocket.emit('roleDealt', {
            role: player.role,
            playerId: player.id
          });
        }
      });

      io.to(roomCode).emit('gameStarted', {
        totalPlayers: room.players.length,
        stats: getGameStats(room.players)
      });

      console.log(`Game started in room ${roomCode}`);
    });

    /**
     * Player reveals their role (shows for 3 seconds)
     */
    socket.on('revealRole', (data) => {
      const { roomCode, playerId } = data;

      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      // Only send to the player themselves
      socket.emit('roleReveal', {
        role: player.role,
        duration: 3000 // 3 seconds in milliseconds
      });
    });

    /**
     * Mark player as eliminated (host only)
     */
    socket.on('eliminatePlayer', (data) => {
      const { roomCode, playerId } = data;

      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      player.eliminated = true;
      room.updatedAt = new Date();

      io.to(roomCode).emit('playerEliminated', {
        playerId,
        stats: getGameStats(room.players)
      });
    });

    /**
     * Shield a player (host only, for doctor saves)
     */
    socket.on('shieldPlayer', (data) => {
      const { roomCode, playerId } = data;

      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        socket.emit('error', { message: 'Player not found' });
        return;
      }

      player.shielded = true;
      setTimeout(() => {
        player.shielded = false;
      }, 60000); // Shield lasts 1 minute (1 round)

      io.to(roomCode).emit('playerShielded', {
        playerId
      });
    });

    /**
     * Reveal all players' roles (end game)
     */
    socket.on('revealAll', (data) => {
      const { roomCode } = data;

      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const revelation = room.players.map(player => ({
        id: player.id,
        name: player.name,
        role: player.role,
        eliminated: player.eliminated
      }));

      io.to(roomCode).emit('allRolesRevealed', {
        players: revelation
      });
    });

    /**
     * Reset game (host only)
     */
    socket.on('resetGame', (data) => {
      const { roomCode } = data;

      const room = rooms.get(roomCode);
      if (!room || room.hostId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      room.gameStarted = false;
      room.players.forEach(player => {
        player.role = null;
        player.eliminated = false;
        player.shielded = false;
      });

      io.to(roomCode).emit('gameReset', {
        totalPlayers: room.players.length
      });
    });

    /**
     * Get room state
     */
    socket.on('getRoomState', (data) => {
      const { roomCode } = data;

      const room = rooms.get(roomCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const playerList = room.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.id === room.hostId,
        eliminated: p.eliminated,
        shielded: p.shielded
      }));

      socket.emit('roomState', {
        roomCode: room.code,
        gameStarted: room.gameStarted,
        players: playerList,
        configuration: room.configuration,
        stats: getGameStats(room.players)
      });
    });
  });
};
