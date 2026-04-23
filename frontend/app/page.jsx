'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import Lobby from '@/components/Lobby';
import HostDashboard from '@/components/HostDashboard';
import PlayerScreen from '@/components/PlayerScreen';
import RoleReveal from '@/components/RoleReveal';
import RoleRevelation from '@/components/RoleRevelation';
import Notification from '@/components/Notification';

export default function Home() {
  const { 
    gameState, createRoom, joinRoom, updateConfiguration, startGame, 
    eliminatePlayer, shieldPlayer, revealAll, resetGame, kickPlayer, 
    leaveRoom, requestHostSwitch, acceptHostSwitch, declineHostSwitch,
    setError, clearError
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
      setError(error.message);
    }
  };

  const handleJoinRoom = async (roomCode, playerName) => {
    try {
      await joinRoom(roomCode, playerName);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      {/* Dynamic Views */}
      {viewState === 'lobby' && <Lobby onRoomCreated={handleCreateRoom} onJoinRoom={handleJoinRoom} />}
      
      {viewState === 'roleReveal' && (
        <RoleReveal role={gameState.myRole} onRevealComplete={() => {}} />
      )}
      
      {viewState === 'roleRevelation' && (
        <RoleRevelation 
          players={gameState.players} 
          isHost={gameState.isHost} 
          onClose={() => gameState.isHost ? resetGame() : setViewState('player')} 
        />
      )}
      
      {viewState === 'host' && (
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
      )}
      
      {viewState === 'player' && (
        <PlayerScreen
          players={gameState.players}
          isHost={gameState.isHost}
          onRevealAll={revealAll}
          onReset={resetGame}
          onLeave={leaveRoom}
          onRequestHost={requestHostSwitch}
        />
      )}

      {/* Global Notification Overlay */}
      <Notification 
        message={gameState.error} 
        onClose={clearError} 
        type="error"
      />
    </>
  );
}
