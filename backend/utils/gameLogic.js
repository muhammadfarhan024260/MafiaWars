const { v4: uuidv4 } = require('uuid');

/**
 * Generate a random 4-digit room code
 */
function generateRoomCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Initialize a new game room
 */
function createRoom(hostSocketId, hostName) {
  const roomCode = generateRoomCode();
  return {
    code: roomCode,
    hostId: hostSocketId,
    hostName,
    players: [], // Players array starts empty, host is not a player
    gameStarted: false,
    configuration: {
      mafiaCount: 1,
      doctorCount: 1
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Assign roles to players
 */
function assignRoles(players, mafiaCount, doctorCount) {
  const totalPlayers = players.length;
  const civilianCount = Math.max(0, totalPlayers - mafiaCount - doctorCount);

  // Create role array
  const roles = [
    ...Array(mafiaCount).fill('MAFIA'),
    ...Array(doctorCount).fill('DOCTOR'),
    ...Array(civilianCount).fill('CIVILIAN')
  ];

  // Shuffle roles
  const shuffledRoles = shuffleArray(roles);

  // Assign roles to players
  const playersCopy = [...players];
  playersCopy.forEach((player, index) => {
    player.role = shuffledRoles[index];
    player.eliminated = false;
    player.shielded = false;
  });

  return playersCopy;
}

/**
 * Get game statistics
 */
function getGameStats(players) {
  const alive = players.filter(p => !p.eliminated);
  const mafia = alive.filter(p => p.role === 'MAFIA');
  const doctors = alive.filter(p => p.role === 'DOCTOR');
  const civilians = alive.filter(p => p.role === 'CIVILIAN');

  return {
    totalAlive: alive.length,
    mafiaAlive: mafia.length,
    doctorsAlive: doctors.length,
    civiliansAlive: civilians.length,
    totalEliminated: players.filter(p => p.eliminated).length
  };
}

module.exports = {
  generateRoomCode,
  createRoom,
  shuffleArray,
  assignRoles,
  getGameStats
};
