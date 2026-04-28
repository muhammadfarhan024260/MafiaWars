'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { saveSession, loadSession, clearSession } from '@/lib/session';

const GameContext = createContext(null);

const INITIAL_STATE = {
  roomCode:          null,
  playerId:          null,
  isHost:            false,
  players:           [],
  configuration:     { mafiaCount: 1, doctorCount: 0, customRoles: [] },
  gameStarted:       false,
  myRole:            null,
  mafiaTeammates:    [], // auto mode: other mafia members [{id, name}]
  showRoleReveal:    false,
  showRoleRevelation:false,
  pendingHostSwitch: null, // { userId, name }
  // Auto mode state
  gameMode:          'manual', // 'manual' | 'automatic'
  currentPhase:      'lobby',  // 'lobby' | 'night' | 'day'
  roundNumber:       0,
  phaseTimerSeconds: 0,
  isSpectator:       false,
  dayVotes:          {},       // { [userId]: targetId }
  nightResult:       null,     // { eliminated: {id,name}|null, saved: bool }
  dayResult:         null,     // { eliminated: {id,name}|null, tie: bool }
  gameOverData:      null,     // { winner, players[] }
  error:             null,
};

export function GameProvider({ children }) {
  const { socket, userId } = useSocket();
  const [gameState, setGameState] = useState(INITIAL_STATE);

  // ── Actions ─────────────────────────────────────────────────────────────

  const createRoom = useCallback((hostName) => new Promise((resolve, reject) => {
    if (!socket) return reject(new Error('Socket not connected'));
    const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);

    socket.once('roomCreated', (data) => {
      clearTimeout(timeout);
      setGameState(prev => ({ ...prev, roomCode: data.roomCode, isHost: true }));
      saveSession({ roomCode: data.roomCode, playerId: null, isHost: true });
      resolve(data);
    });
    socket.once('error', (err) => {
      clearTimeout(timeout);
      setGameState(prev => ({ ...prev, error: err.message }));
      reject(err);
    });

    socket.emit('createRoom', { hostName, userId });
  }), [socket, userId]);

  const joinRoom = useCallback((roomCode, playerName) => new Promise((resolve, reject) => {
    if (!socket) return reject(new Error('Socket not connected'));
    const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);

    socket.once('roomJoined', (data) => {
      clearTimeout(timeout);
      setGameState(prev => ({ ...prev, roomCode: data.roomCode, playerId: data.playerId, isHost: false }));
      saveSession({ roomCode: data.roomCode, playerId: data.playerId, isHost: false });
      resolve(data);
    });
    socket.once('error', (err) => {
      clearTimeout(timeout);
      setGameState(prev => ({ ...prev, error: err.message }));
      reject(err);
    });

    socket.emit('joinRoom', { roomCode, playerName, userId });
  }), [socket, userId]);

  const updateConfiguration = useCallback((mafiaCount, doctorCount, customRoles = []) => {
    if (!socket) return;
    socket.emit('updateConfiguration', { roomCode: gameState.roomCode, mafiaCount, doctorCount, customRoles });
  }, [socket, gameState.roomCode]);

  const startGame    = useCallback(() => socket?.emit('startGame',    { roomCode: gameState.roomCode }), [socket, gameState.roomCode]);
  const revealRole   = useCallback(() => socket?.emit('revealRole',   { roomCode: gameState.roomCode, playerId: gameState.playerId }), [socket, gameState.roomCode, gameState.playerId]);
  const eliminatePlayer = useCallback((playerId) => socket?.emit('eliminatePlayer', { roomCode: gameState.roomCode, playerId }), [socket, gameState.roomCode]);
  const shieldPlayer    = useCallback((playerId) => socket?.emit('shieldPlayer',    { roomCode: gameState.roomCode, playerId }), [socket, gameState.roomCode]);
  const revealAll    = useCallback(() => socket?.emit('revealAll',    { roomCode: gameState.roomCode }), [socket, gameState.roomCode]);
  const resetGame    = useCallback(() => socket?.emit('resetGame',    { roomCode: gameState.roomCode }), [socket, gameState.roomCode]);
  const kickPlayer   = useCallback((playerId) => socket?.emit('kickPlayer',   { roomCode: gameState.roomCode, playerId }), [socket, gameState.roomCode]);
  const leaveRoom    = useCallback(() => {
    if (socket && gameState.roomCode) {
      socket.emit('leaveRoom', { roomCode: gameState.roomCode, userId });
      clearSession();
      setGameState(INITIAL_STATE);
    }
  }, [socket, gameState.roomCode, userId]);

  const toggleGameMode   = useCallback((gameMode) => socket?.emit('toggleGameMode', { roomCode: gameState.roomCode, gameMode }), [socket, gameState.roomCode]);
  const submitNightAction = useCallback((targetId) => socket?.emit('submitNightAction', { roomCode: gameState.roomCode, userId, targetId }), [socket, gameState.roomCode, userId]);
  const submitDayVote     = useCallback((targetId) => socket?.emit('submitDayVote',     { roomCode: gameState.roomCode, userId, targetId }), [socket, gameState.roomCode, userId]);

  const requestHostSwitch = useCallback(() => {
    if (socket && gameState.roomCode) {
      socket.emit('requestHostSwitch', { roomCode: gameState.roomCode, userId });
    }
  }, [socket, gameState.roomCode, userId]);

  const acceptHostSwitch = useCallback((targetUserId) => {
    if (socket && gameState.roomCode) {
      socket.emit('acceptHostSwitch', { roomCode: gameState.roomCode, targetUserId });
      setGameState(prev => ({ ...prev, pendingHostSwitch: null }));
    }
  }, [socket, gameState.roomCode]);

  const declineHostSwitch = useCallback(() => {
    setGameState(prev => ({ ...prev, pendingHostSwitch: null }));
  }, []);

  const setError = useCallback((msg) => {
    setGameState(prev => ({ ...prev, error: msg }));
  }, []);

  const clearError = useCallback(() => {
    setGameState(prev => ({ ...prev, error: null }));
  }, []);

  // ── Socket listeners ─────────────────────────────────────────────────────

  React.useEffect(() => {
    if (!socket) return;

    const handlers = {

      // ── Re-authorize on socket reconnect (socket.id changes each time) ─
      connect: () => {
        if (gameState.roomCode) {
          socket.emit('rejoinSession', { userId, roomCode: gameState.roomCode });
        }
      },

      // ── Reconnection ──────────────────────────────────────────────────
      sessionRestored: (data) => {
        console.log('Session restored:', data);
        setGameState(prev => ({
          ...prev,
          roomCode:       data.roomCode,
          playerId:       data.playerId   ?? prev.playerId,
          isHost:         data.isHost,
          players:        data.players    ?? prev.players,
          gameStarted:    data.gameStarted,
          myRole:         data.myRole     ?? prev.myRole,
          showRoleReveal: data.gameStarted && !data.isHost && data.myRole,
          configuration:  data.configuration ?? prev.configuration,
          error:          null,
        }));
        saveSession({ roomCode: data.roomCode, playerId: data.playerId, isHost: data.isHost });
      },

      sessionExpired: () => {
        clearSession();
        setGameState(INITIAL_STATE);
      },

      // ── Normal game events ─────────────────────────────────────────────
      playerListUpdate: (players) => setGameState(prev => ({ ...prev, players })),
      hostSwitchRequest: (data) => setGameState(prev => ({ ...prev, pendingHostSwitch: data })),

      configurationUpdated: (config) => setGameState(prev => ({
        ...prev,
        configuration: { mafiaCount: config.mafiaCount, doctorCount: config.doctorCount, customRoles: config.customRoles ?? [] },
      })),

      gameStarted: (data) => setGameState(prev => ({
        ...prev,
        gameStarted:  true,
        showRoleReveal: true,
        gameMode:     data.gameMode ?? prev.gameMode,
      })),

      roleDealt: (data) => setGameState(prev => ({
        ...prev,
        myRole:          data.role,
        mafiaTeammates:  data.mafiaTeammates ?? [],
        playerId:        data.playerId ?? prev.playerId,
      })),

      roleReveal: (data) => setGameState(prev => ({ ...prev, myRole: data.role, showRoleReveal: true })),

      playerEliminated: () => socket.emit('getRoomState', { roomCode: gameState.roomCode }),

      allRolesRevealed: (data) => setGameState(prev => ({
        ...prev,
        showRoleRevelation: true,
        players: data.players,
      })),

      gameReset: () => {
        setGameState(prev => ({
          ...prev,
          gameStarted:        false,
          myRole:             null,
          mafiaTeammates:     [],
          players:            prev.players.map(p => ({ ...p, role: null, eliminated: false, shielded: false })),
          showRoleReveal:     false,
          showRoleRevelation: false,
          currentPhase:       'lobby',
          roundNumber:        0,
          isSpectator:        false,
          dayVotes:           {},
          nightResult:        null,
          dayResult:          null,
          gameOverData:       null,
        }));
      },

      // ── Auto mode events ────────────────────────────────────────────────
      gameModeChanged: (data) => setGameState(prev => ({ ...prev, gameMode: data.gameMode })),

      phaseChanged: (data) => setGameState(prev => ({
        ...prev,
        currentPhase:      data.phase,
        roundNumber:       data.roundNumber,
        phaseTimerSeconds: data.timerSeconds,
        nightResult:       null,
        dayResult:         null,
        showRoleReveal:    false,
      })),

      nightResolved: (data) => setGameState(prev => ({
        ...prev,
        nightResult: data,
        isSpectator: data.eliminated?.id === prev.playerId ? true : prev.isSpectator,
        players: data.eliminated
          ? prev.players.map(p => p.id === data.eliminated.id ? { ...p, eliminated: true } : p)
          : prev.players,
      })),

      dayVoteUpdate: (data) => setGameState(prev => ({ ...prev, dayVotes: data.votes })),

      dayResolved: (data) => setGameState(prev => ({
        ...prev,
        dayResult: data,
        isSpectator: data.eliminated?.id === prev.playerId ? true : prev.isSpectator,
        players: data.eliminated
          ? prev.players.map(p => p.id === data.eliminated.id ? { ...p, eliminated: true } : p)
          : prev.players,
      })),

      gameOver: (data) => setGameState(prev => ({
        ...prev,
        gameOverData:       data,
        gameStarted:        false,
        currentPhase:       'lobby',
        isSpectator:        false,
      })),

      roomState: (state) => setGameState(prev => ({ ...prev, ...state, roomCode: state.roomCode })),

      roomClosed: () => {
        clearSession();
        setGameState(INITIAL_STATE);
      },

      error: (err) => setGameState(prev => ({ ...prev, error: err.message })),
    };

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));

    // Restore session once listeners are active
    const session = loadSession();
    if (session?.roomCode && userId) {
      socket.emit('rejoinSession', { userId, roomCode: session.roomCode });
    }

    return () => Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn));

  // gameState.roomCode needed for playerEliminated handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, gameState.roomCode]);

  return (
    <GameContext.Provider value={{
      gameState,
      createRoom, joinRoom, updateConfiguration,
      startGame, revealRole,
      eliminatePlayer, shieldPlayer,
      revealAll, resetGame, kickPlayer, leaveRoom,
      requestHostSwitch, acceptHostSwitch, declineHostSwitch,
      toggleGameMode, submitNightAction, submitDayVote,
      setError, clearError
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
