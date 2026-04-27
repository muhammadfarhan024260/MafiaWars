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

/**
 * Weighted selection for Mafia roles
 */
function assignRoles(room) {
  const { players, configuration, mafiaWeights } = room;
  const mCount = Number(configuration.mafiaCount);
  const dCount = Number(configuration.doctorCount);

  // Initialize weights for new players
  players.forEach(p => {
    if (!mafiaWeights[p.userId]) mafiaWeights[p.userId] = 10;
  });

  const availablePlayers = [...players];
  const assignedMafia = [];

  // 1. Pick Mafia using weights
  for (let m = 0; m < mCount; m++) {
    if (availablePlayers.length === 0) break;

    let totalWeight = 0;
    availablePlayers.forEach(p => { totalWeight += mafiaWeights[p.userId]; });

    let random = Math.random() * totalWeight;
    let sum = 0;
    let pickedIndex = -1;

    for (let i = 0; i < availablePlayers.length; i++) {
      sum += mafiaWeights[availablePlayers[i].userId];
      if (random <= sum) {
        pickedIndex = i;
        break;
      }
    }

    if (pickedIndex === -1) pickedIndex = 0;
    
    const picked = availablePlayers.splice(pickedIndex, 1)[0];
    picked.role = 'MAFIA';
    assignedMafia.push(picked);
    
    // Reset weight for next time
    mafiaWeights[picked.userId] = 1;
  }

  // 2. Assign Doctors (Purely random from remaining)
  const remainingAfterMafia = shuffleArray(availablePlayers);
  for (let d = 0; d < dCount; d++) {
    if (remainingAfterMafia.length === 0) break;
    const picked = remainingAfterMafia.shift();
    picked.role = 'DOCTOR';
  }

  // 3. Assign custom roles (random from remaining)
  const customRoles = configuration.customRoles || [];
  for (const cr of customRoles) {
    for (let i = 0; i < cr.count; i++) {
      if (remainingAfterMafia.length === 0) break;
      const picked = remainingAfterMafia.shift();
      picked.role = cr.name.toUpperCase();
    }
  }

  // 4. Everyone else is Civilian
  remainingAfterMafia.forEach(p => {
    p.role = 'CIVILIAN';
  });

  // 5. Update weights for non-mafia (Increase pity)
  players.forEach(p => {
    if (p.role !== 'MAFIA') {
      mafiaWeights[p.userId] += 5;
      // Cap weight at 50 to prevent huge outliers
      if (mafiaWeights[p.userId] > 50) mafiaWeights[p.userId] = 50;
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
