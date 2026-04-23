const { v4: uuidv4 } = require('uuid');

function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function createRoom(hostSocketId, hostName, hostUserId) {
  const roomCode = generateRoomCode();
  return {
    code: roomCode,
    hostId:     hostSocketId,
    hostUserId: hostUserId || hostSocketId,
    hostName,
    players: [],
    gameStarted: false,
    configuration: { mafiaCount: 1, doctorCount: 0 },
    createdAt:  new Date(),
    updatedAt:  new Date(),
  };
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function assignRoles(players, mafiaCount, doctorCount) {
  const mCount = Number(mafiaCount);
  const dCount = Number(doctorCount);
  const civilianCount = Math.max(0, players.length - mCount - dCount);
  const roles = [
    ...Array(mCount).fill('MAFIA'),
    ...Array(dCount).fill('DOCTOR'),
    ...Array(civilianCount).fill('CIVILIAN'),
  ];
  const shuffledRoles = shuffleArray(roles);
  const playersCopy = [...players];
  playersCopy.forEach((player, i) => {
    player.role      = shuffledRoles[i];
    player.eliminated = false;
    player.shielded   = false;
  });
  return playersCopy;
}

function getGameStats(players) {
  const alive     = players.filter(p => !p.eliminated);
  return {
    totalAlive:       alive.length,
    mafiaAlive:       alive.filter(p => p.role === 'MAFIA').length,
    doctorsAlive:     alive.filter(p => p.role === 'DOCTOR').length,
    civiliansAlive:   alive.filter(p => p.role === 'CIVILIAN').length,
    totalEliminated:  players.filter(p => p.eliminated).length,
  };
}

module.exports = { generateRoomCode, createRoom, shuffleArray, assignRoles, getGameStats };
