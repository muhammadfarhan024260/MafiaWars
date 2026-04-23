const USER_KEY    = 'mw_user_id';
const SESSION_KEY = 'mw_session';

function generateId() {
  try { return crypto.randomUUID(); } catch (_) {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }
}

export function getOrCreateUserId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(USER_KEY);
  if (!id) { id = generateId(); localStorage.setItem(USER_KEY, id); }
  return id;
}

export function saveSession({ roomCode, playerId, isHost }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode, playerId, isHost }));
}

export function loadSession() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) ?? null; }
  catch (_) { return null; }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}
