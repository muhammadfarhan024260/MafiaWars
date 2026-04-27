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
    configuration: { mafiaCount: 1, doctorCount: 0, customRoles: [] },
    mafiaWeights: {}, // Stores weights by userId
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

// Picks one player from pool using weighted random, removes them from pool
function weightedPick(pool, weights) {
  let total = 0;
  pool.forEach(p => { total += weights[p.userId]; });
  let r = Math.random() * total;
  let s = 0;
  for (let i = 0; i < pool.length; i++) {
    s += weights[pool[i].userId];
    if (r <= s) return pool.splice(i, 1)[0];
  }
  return pool.splice(0, 1)[0]; // fallback
}

/**
 * Weighted role assignment — all special roles (Mafia, Doctor, custom) use
 * the same pity weight so no player gets stuck as Civilian repeatedly.
 * Civilians gain +5 weight each round (cap 50). Any special role resets to 1.
 */
function assignRoles(room) {
  const { players, configuration, mafiaWeights: roleWeights } = room;
  const mCount = Number(configuration.mafiaCount);
  const dCount = Number(configuration.doctorCount);
  const customRoles = configuration.customRoles || [];

  // Initialize weights for players joining for the first time
  players.forEach(p => {
    if (!roleWeights[p.userId]) roleWeights[p.userId] = 10;
  });

  const pool = [...players];

  // 1. Pick Mafia using weights
  for (let m = 0; m < mCount && pool.length > 0; m++) {
    const picked = weightedPick(pool, roleWeights);
    picked.role = 'MAFIA';
  }

  // 2. Pick Doctor using weights (from remaining pool)
  for (let d = 0; d < dCount && pool.length > 0; d++) {
    const picked = weightedPick(pool, roleWeights);
    picked.role = 'DOCTOR';
  }

  // 3. Pick custom roles using weights (from remaining pool)
  for (const cr of customRoles) {
    for (let i = 0; i < cr.count && pool.length > 0; i++) {
      const picked = weightedPick(pool, roleWeights);
      picked.role = cr.name.toUpperCase();
    }
  }

  // 4. Everyone left is Civilian
  pool.forEach(p => { p.role = 'CIVILIAN'; });

  // 5. Update weights for next round
  //    - Special role players reset to 1 (they just had their turn)
  //    - Civilians gain +5 pity (capped at 50)
  players.forEach(p => {
    if (p.role === 'CIVILIAN') {
      roleWeights[p.userId] = Math.min(roleWeights[p.userId] + 5, 50);
    } else {
      roleWeights[p.userId] = 1;
    }
    p.eliminated = false;
    p.shielded = false;
  });

  return players;
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
