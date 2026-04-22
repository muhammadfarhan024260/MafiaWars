'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { socket } = useSocket();
  const [gameState, setGameState] = useState({
    roomCode: null,
    playerId: null,
    isHost: false,
    players: [],
    configuration: { mafiaCount: 1, doctorCount: 1 },
    gameStarted: false,
    myRole: null,
    showRoleReveal: false,
    showRoleRevelation: false,
    error: null
  });

  // Create room
  const createRoom = useCallback((hostName) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Room creation timeout'));
      }, 5000);

      socket.once('roomCreated', (data) => {
        clearTimeout(timeout);
        setGameState(prev => ({
          ...prev,
          roomCode: data.roomCode,
          isHost: data.isHost
        }));
        resolve(data);
      });

      socket.once('error', (err) => {
        clearTimeout(timeout);
        setGameState(prev => ({ ...prev, error: err.message }));
        reject(err);
      });

      socket.emit('createRoom', { hostName });
    });
  }, [socket]);

  // Join room
  const joinRoom = useCallback((roomCode, playerName) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Room join timeout'));
      }, 5000);

      socket.once('roomJoined', (data) => {
        clearTimeout(timeout);
        setGameState(prev => ({
          ...prev,
          roomCode: data.roomCode,
          playerId: data.playerId,
          isHost: data.isHost
        }));
        resolve(data);
      });

      socket.once('error', (err) => {
        clearTimeout(timeout);
        setGameState(prev => ({ ...prev, error: err.message }));
        reject(err);
      });

      socket.emit('joinRoom', { roomCode, playerName });
    });
  }, [socket]);

  // Update configuration
  const updateConfiguration = useCallback((mafiaCount, doctorCount) => {
    if (!socket) return;
    socket.emit('updateConfiguration', {
      roomCode: gameState.roomCode,
      mafiaCount,
      doctorCount
    });
  }, [socket, gameState.roomCode]);

  // Start game
  const startGame = useCallback(() => {
    if (!socket) return;
    socket.emit('startGame', { roomCode: gameState.roomCode });
  }, [socket, gameState.roomCode]);

  // Reveal role
  const revealRole = useCallback(() => {
    if (!socket) return;
    socket.emit('revealRole', {
      roomCode: gameState.roomCode,
      playerId: gameState.playerId
    });
  }, [socket, gameState.roomCode, gameState.playerId]);

  // Eliminate player
  const eliminatePlayer = useCallback((playerId) => {
    if (!socket) return;
    socket.emit('eliminatePlayer', {
      roomCode: gameState.roomCode,
      playerId
    });
  }, [socket, gameState.roomCode]);

  // Shield player
  const shieldPlayer = useCallback((playerId) => {
    if (!socket) return;
    socket.emit('shieldPlayer', {
      roomCode: gameState.roomCode,
      playerId
    });
  }, [socket, gameState.roomCode]);

  // Reveal all
  const revealAll = useCallback(() => {
    if (!socket) return;
    socket.emit('revealAll', { roomCode: gameState.roomCode });
  }, [socket, gameState.roomCode]);

  // Reset game
  const resetGame = useCallback(() => {
    if (!socket) return;
    socket.emit('resetGame', { roomCode: gameState.roomCode });
  }, [socket, gameState.roomCode]);

  // Set up socket listeners
  React.useEffect(() => {
    if (!socket) return;

    socket.on('playerListUpdate', (players) => {
      setGameState(prev => ({ ...prev, players }));
    });

    socket.on('configurationUpdated', (config) => {
      setGameState(prev => ({
        ...prev,
        configuration: {
          mafiaCount: config.mafiaCount,
          doctorCount: config.doctorCount
        }
      }));
    });

    socket.on('gameStarted', () => {
      setGameState(prev => ({ ...prev, gameStarted: true, showRoleReveal: true }));
    });

    socket.on('roleDealt', (data) => {
      setGameState(prev => ({ ...prev, myRole: data.role }));
    });

    socket.on('roleReveal', (data) => {
      setGameState(prev => ({ ...prev, myRole: data.role, showRoleReveal: true }));
    });

    socket.on('playerEliminated', () => {
      // Refresh room state
      socket.emit('getRoomState', { roomCode: gameState.roomCode });
    });

    socket.on('allRolesRevealed', (data) => {
      setGameState(prev => ({
        ...prev,
        showRoleRevelation: true,
        players: data.players
      }));
    });

    socket.on('gameReset', () => {
      setGameState(prev => ({
        ...prev,
        gameStarted: false,
        myRole: null,
        showRoleReveal: false,
        showRoleRevelation: false
      }));
    });

    socket.on('roomState', (state) => {
      setGameState(prev => ({
        ...prev,
        ...state,
        roomCode: state.roomCode
      }));
    });

    socket.on('error', (err) => {
      setGameState(prev => ({ ...prev, error: err.message }));
    });

    return () => {
      socket.off('playerListUpdate');
      socket.off('configurationUpdated');
      socket.off('gameStarted');
      socket.off('roleDealt');
      socket.off('roleReveal');
      socket.off('playerEliminated');
      socket.off('allRolesRevealed');
      socket.off('gameReset');
      socket.off('roomState');
      socket.off('error');
    };
  }, [socket, gameState.roomCode]);

  return (
    <GameContext.Provider value={{
      gameState,
      createRoom,
      joinRoom,
      updateConfiguration,
      startGame,
      revealRole,
      eliminatePlayer,
      shieldPlayer,
      revealAll,
      resetGame
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
