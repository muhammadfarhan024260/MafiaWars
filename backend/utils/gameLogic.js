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
    configuration: { mafiaCount: 1, doctorCount: 0, jesterCount: 0, customRoles: [] },
    mafiaWeights: {}, // Stores weights by userId
    // Automatic mode state
    gameMode:     'manual', // 'manual' | 'automatic'
    currentPhase: 'lobby',  // 'lobby' | 'night' | 'day'
    roundNumber:  0,
    nightActions: { submissions: [], resolved: false },
    dayVotes:     { votes: {}, resolved: false },
    phaseTimer:   null,
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
  const jCount = Number(configuration.jesterCount || 0);
  const customRoles = configuration.customRoles || [];

  // Initialize weights for players joining for the first time
  players.forEach(p => {
    if (!roleWeights[p.userId]) roleWeights[p.userId] = 10;
  });

  const pool = [...players];

  // 1. Pick Mafia
  for (let m = 0; m < mCount && pool.length > 0; m++) {
    const picked = weightedPick(pool, roleWeights);
    picked.role = 'MAFIA';
  }

  // 2. Pick Doctor
  for (let d = 0; d < dCount && pool.length > 0; d++) {
    const picked = weightedPick(pool, roleWeights);
    picked.role = 'DOCTOR';
  }

  // 3. Pick Jester
  for (let j = 0; j < jCount && pool.length > 0; j++) {
    const picked = weightedPick(pool, roleWeights);
    picked.role = 'JESTER';
  }

  // 4. Pick custom roles
  for (const cr of customRoles) {
    for (let i = 0; i < cr.count && pool.length > 0; i++) {
      const picked = weightedPick(pool, roleWeights);
      picked.role = cr.name.toUpperCase();
    }
  }

  // 5. Everyone left is Civilian
  pool.forEach(p => { p.role = 'CIVILIAN'; });

  // 6. Update weights — Civilian gains +5 pity (cap 50), special roles reset to 1
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

function checkWinCondition(players) {
  const alive = players.filter(p => !p.eliminated);
  const mafiaAlive = alive.filter(p => p.role === 'MAFIA').length;
  // Jester counts as non-Mafia for this check
  const nonMafiaAlive = alive.filter(p => p.role !== 'MAFIA').length;
  if (mafiaAlive === 0) return 'CIVILIANS';
  if (mafiaAlive >= nonMafiaAlive) return 'MAFIA';
  return null;
}

function resolveNightActions(room) {
  const { nightActions, players } = room;
  const alive = players.filter(p => !p.eliminated);

  // Collect mafia kill votes
  const mafiaUserIds = new Set(alive.filter(p => p.role === 'MAFIA').map(p => p.userId));
  const mafiaSubmissions = nightActions.submissions.filter(s => mafiaUserIds.has(s.userId));

  let killTargetId = null;
  if (mafiaSubmissions.length > 0) {
    // Count votes per target
    const tally = {};
    mafiaSubmissions.forEach(s => {
      if (!tally[s.targetId]) tally[s.targetId] = { count: 0, firstTs: s.timestamp };
      tally[s.targetId].count++;
      if (s.timestamp < tally[s.targetId].firstTs) tally[s.targetId].firstTs = s.timestamp;
    });
    // Majority pick; tie → earliest timestamp
    const sorted = Object.entries(tally).sort((a, b) =>
      b[1].count !== a[1].count ? b[1].count - a[1].count : a[1].firstTs - b[1].firstTs
    );
    killTargetId = sorted[0][0];
  }

  // Doctor save
  const doctorUserIds = new Set(alive.filter(p => p.role === 'DOCTOR').map(p => p.userId));
  const doctorSubmission = nightActions.submissions.find(s => doctorUserIds.has(s.userId));
  const saveTargetId = doctorSubmission ? doctorSubmission.targetId : null;

  let eliminated = null;
  let saved = false;

  if (killTargetId) {
    if (killTargetId === saveTargetId) {
      saved = true;
    } else {
      const target = players.find(p => p.id === killTargetId);
      if (target) {
        target.eliminated = true;
        eliminated = { id: target.id, name: target.name };
      }
    }
  }

  return { eliminated, saved };
}

function resolveDayVotes(room) {
  const { dayVotes, players } = room;
  const tally = {};
  Object.values(dayVotes.votes).forEach(targetId => {
    tally[targetId] = (tally[targetId] || 0) + 1;
  });

  if (Object.keys(tally).length === 0) return { eliminated: null, tie: false };

  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const topCount = sorted[0][1];
  const topCandidates = sorted.filter(([, c]) => c === topCount);

  if (topCandidates.length > 1) return { eliminated: null, tie: true };

  const target = players.find(p => p.id === topCandidates[0][0]);
  if (!target) return { eliminated: null, tie: false };
  target.eliminated = true;
  return { eliminated: { id: target.id, name: target.name }, tie: false };
}

module.exports = { generateRoomCode, createRoom, shuffleArray, assignRoles, getGameStats, checkWinCondition, resolveNightActions, resolveDayVotes };
