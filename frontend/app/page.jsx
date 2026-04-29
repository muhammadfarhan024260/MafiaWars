'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import Lobby from '@/components/Lobby';
import HostDashboard from '@/components/HostDashboard';
import PlayerScreen from '@/components/PlayerScreen';
import RoleReveal from '@/components/RoleReveal';
import RoleRevelation from '@/components/RoleRevelation';
import NightActionScreen from '@/components/NightActionScreen';
import NightResultScreen from '@/components/NightResultScreen';
import DayVotingScreen from '@/components/DayVotingScreen';
import DayResultScreen from '@/components/DayResultScreen';
import SpectatorScreen from '@/components/SpectatorScreen';
import GameOverScreen from '@/components/GameOverScreen';
import Notification from '@/components/Notification';

export default function Home() {
  const {
    gameState, createRoom, joinRoom, updateConfiguration, startGame,
    eliminatePlayer, shieldPlayer, revealAll, resetGame, kickPlayer,
    leaveRoom, requestHostSwitch, acceptHostSwitch, declineHostSwitch,
    toggleGameMode, submitNightAction, submitDayVote,
    setError, clearError,
  } = useGame();

  const [viewState, setViewState] = useState('lobby');

  useEffect(() => {
    const {
      roomCode, isHost, gameStarted, showRoleReveal, showRoleRevelation,
      myRole, gameMode, currentPhase, isSpectator, nightResult, dayResult,
      gameOverData,
    } = gameState;

    if (!roomCode) { setViewState('lobby'); return; }

    // Game over always takes priority
    if (gameOverData) { setViewState('gameOver'); return; }

    // Role reveal flash — in auto mode host is also a player so they see it too
    if (showRoleReveal && myRole && (!isHost || gameMode === 'automatic')) { setViewState('roleReveal'); return; }

    // Auto mode phases
    if (gameMode === 'automatic' && gameStarted) {
      if (nightResult) { setViewState('nightResult'); return; }
      if (dayResult)   { setViewState('dayResult');   return; }
      if (currentPhase === 'night') { setViewState(isSpectator ? 'spectator' : 'nightAction'); return; }
      if (currentPhase === 'day')   { setViewState(isSpectator ? 'spectator' : 'dayVoting');   return; }
    }

    // Manual mode
    if (showRoleRevelation) { setViewState('roleRevelation'); return; }
    if (isHost)             { setViewState('host');           return; }
    setViewState('player');
  }, [
    gameState.roomCode, gameState.isHost, gameState.gameStarted,
    gameState.showRoleReveal, gameState.showRoleRevelation, gameState.myRole,
    gameState.gameMode, gameState.currentPhase, gameState.isSpectator,
    gameState.nightResult, gameState.dayResult, gameState.gameOverData,
  ]);

  const handleCreateRoom = async (hostName) => {
    try { await createRoom(hostName); } catch (e) { setError(e.message); }
  };

  const handleJoinRoom = async (roomCode, playerName) => {
    try { await joinRoom(roomCode, playerName); } catch (e) { setError(e.message); }
  };

  return (
    <>
      {viewState === 'lobby' && (
        <Lobby onRoomCreated={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}

      {viewState === 'roleReveal' && (
        <RoleReveal
          role={gameState.myRole}
          onRevealComplete={() => {}}
          configuration={gameState.configuration}
        />
      )}

      {viewState === 'roleRevelation' && (
        <RoleRevelation
          players={gameState.players}
          isHost={gameState.isHost}
          onClose={() => gameState.isHost ? resetGame() : setViewState('player')}
          configuration={gameState.configuration}
        />
      )}

      {viewState === 'host' && (
        <HostDashboard
          roomCode={gameState.roomCode}
          players={gameState.players}
          configuration={gameState.configuration}
          gameMode={gameState.gameMode}
          onUpdateConfig={updateConfiguration}
          onStartGame={startGame}
          onToggleGameMode={toggleGameMode}
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
          roomCode={gameState.roomCode}
          isHost={gameState.isHost}
          onRevealAll={revealAll}
          onReset={resetGame}
          onLeave={leaveRoom}
          onRequestHost={requestHostSwitch}
        />
      )}

      {/* ── Auto mode screens ── */}
      {viewState === 'nightAction' && (
        <NightActionScreen
          players={gameState.players}
          myRole={gameState.myRole}
          myPlayerId={gameState.playerId}
          mafiaTeammates={gameState.mafiaTeammates}
          timerSeconds={gameState.phaseTimerSeconds}
          roundNumber={gameState.roundNumber}
          onSubmit={submitNightAction}
        />
      )}

      {viewState === 'nightResult' && (
        <NightResultScreen
          eliminated={gameState.nightResult?.eliminated ?? null}
          saved={gameState.nightResult?.saved ?? false}
        />
      )}

      {viewState === 'dayVoting' && (
        <DayVotingScreen
          players={gameState.players}
          myPlayerId={gameState.playerId}
          isSpectator={gameState.isSpectator}
          dayVotes={gameState.dayVotes}
          timerSeconds={gameState.phaseTimerSeconds}
          roundNumber={gameState.roundNumber}
          onVote={submitDayVote}
        />
      )}

      {viewState === 'dayResult' && (
        <DayResultScreen
          eliminated={gameState.dayResult?.eliminated ?? null}
          tie={gameState.dayResult?.tie ?? false}
        />
      )}

      {viewState === 'spectator' && (
        <SpectatorScreen
          players={gameState.players}
          currentPhase={gameState.currentPhase}
          dayVotes={gameState.dayVotes}
        />
      )}

      {viewState === 'gameOver' && (
        <GameOverScreen
          winner={gameState.gameOverData?.winner}
          players={gameState.gameOverData?.players ?? []}
          onPlayAgain={gameState.isHost ? resetGame : null}
          onLeave={leaveRoom}
        />
      )}

      {/* ── Host reset button — floats over all auto mode screens ── */}
      {gameState.gameMode === 'automatic' && gameState.gameStarted && gameState.isHost && viewState !== 'gameOver' && (
        <button
          onClick={resetGame}
          className="fixed bottom-6 right-5 z-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all active:scale-95"
          style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(197,17,17,0.3)', color: 'rgba(197,17,17,0.7)', backdropFilter: 'blur(8px)' }}
        >
          Reset
        </button>
      )}

      {/* Global Notification Overlay */}
      <Notification message={gameState.error} onClose={clearError} type="error" />
    </>
  );
}
