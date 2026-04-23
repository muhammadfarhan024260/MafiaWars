'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import Lobby from '@/components/Lobby';
import HostDashboard from '@/components/HostDashboard';
import PlayerScreen from '@/components/PlayerScreen';
import RoleReveal from '@/components/RoleReveal';
import RoleRevelation from '@/components/RoleRevelation';

export default function Home() {
  const { 
    gameState, createRoom, joinRoom, updateConfiguration, startGame, 
    eliminatePlayer, shieldPlayer, revealAll, resetGame, kickPlayer, 
    leaveRoom, requestHostSwitch, acceptHostSwitch, declineHostSwitch 
  } = useGame();
  const [viewState, setViewState] = useState('lobby'); // 'lobby', 'host', 'player', 'roleReveal', 'roleRevelation'

  // Determine what view to show
  useEffect(() => {
    if (!gameState.roomCode) {
      setViewState('lobby');
      return;
    }

    if (gameState.showRoleRevelation) {
      setViewState('roleRevelation');
    } else if (gameState.showRoleReveal && !gameState.isHost && gameState.myRole) {
      setViewState('roleReveal');
    } else if (gameState.isHost && gameState.gameStarted) {
      setViewState('host');
    } else if (gameState.isHost && !gameState.gameStarted) {
      setViewState('host');
    } else if (!gameState.isHost && gameState.gameStarted) {
      setViewState('player');
    } else if (!gameState.isHost) {
      setViewState('player');
    }
  }, [gameState.roomCode, gameState.isHost, gameState.gameStarted, gameState.showRoleReveal, gameState.showRoleRevelation, gameState.myRole]);

  const handleCreateRoom = async (hostName) => {
    try {
      await createRoom(hostName);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleJoinRoom = async (roomCode, playerName) => {
    try {
      await joinRoom(roomCode, playerName);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // Render based on view state
  if (viewState === 'lobby') {
    return <Lobby onRoomCreated={handleCreateRoom} onJoinRoom={handleJoinRoom} />;
  }

  if (viewState === 'roleReveal') {
    return (
      <RoleReveal
        role={gameState.myRole}
        onRevealComplete={() => {
          // Role auto-hides after 3 seconds
        }}
      />
    );
  }

  if (viewState === 'roleRevelation') {
    return (
      <RoleRevelation
        players={gameState.players}
        isHost={gameState.isHost}
        onClose={() => {
          if (gameState.isHost) {
            resetGame();
          } else {
            setViewState('player');
          }
        }}
      />
    );
  }

  if (viewState === 'host') {
    return (
      <HostDashboard
        roomCode={gameState.roomCode}
        players={gameState.players}
        configuration={gameState.configuration}
        onUpdateConfig={updateConfiguration}
        onStartGame={startGame}
        isGameStarted={gameState.gameStarted}
        onRevealAll={revealAll}
        onReset={resetGame}
        onEliminate={eliminatePlayer}
        onShield={shieldPlayer}
        onKick={kickPlayer}
        onLeave={leaveRoom}
        pendingHostSwitch={gameState.pendingHostSwitch}
        onAcceptSwitch={acceptHostSwitch}
        onDeclineSwitch={declineHostSwitch}
      />
    );
  }

  if (viewState === 'player') {
    return (
      <PlayerScreen
        players={gameState.players}
        isHost={gameState.isHost}
        onRevealAll={revealAll}
        onReset={resetGame}
        onLeave={leaveRoom}
        onRequestHost={requestHostSwitch}
      />
    );
  }


  return null;
}
