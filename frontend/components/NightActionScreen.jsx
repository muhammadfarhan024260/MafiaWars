'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function NightActionScreen({
  players,
  myRole,
  myPlayerId,
  mafiaTeammates = [],
  timerSeconds,
  roundNumber,
  onSubmit,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const timerRef = useRef(null);

  const teammateIds = new Set(mafiaTeammates.map(t => t.id));
  const alive = players.filter(p => !p.eliminated);

  useEffect(() => {
    setTimeLeft(timerSeconds);
    setSelectedId(null);
    setSubmitted(false);
  }, [roundNumber, timerSeconds]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [roundNumber]);

  const handleTap = (playerId) => {
    if (submitted || playerId === myPlayerId) return;
    setSelectedId(prev => prev === playerId ? null : playerId);
  };

  const handleConfirm = () => {
    if (!selectedId || submitted) return;
    setSubmitted(true);
    onSubmit(selectedId);
  };

  const selectedPlayer = alive.find(p => p.id === selectedId);
  const progress = timeLeft / timerSeconds;

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 animate-reveal relative overflow-hidden">

      {/* Ambient dark glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(120,0,0,0.12) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="relative z-10 pt-4 pb-6 text-center space-y-1">
        <p className="text-[9px] text-white/20 uppercase tracking-[0.45em]">Round {roundNumber}</p>
        <h1 className="font-bebas text-5xl text-white/80 tracking-widest leading-none">NIGHT FALLS</h1>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
          {submitted ? 'Choice submitted — waiting for others' : selectedId ? 'Confirm your choice below' : 'Choose a player'}
        </p>
      </div>

      {/* Timer bar */}
      <div className="relative z-10 w-full h-0.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000 linear"
          style={{
            width: `${progress * 100}%`,
            background: progress > 0.4 ? 'rgba(255,255,255,0.3)' : 'rgba(197,17,17,0.7)',
          }}
        />
      </div>
      <p className="relative z-10 text-center text-[10px] text-white/20 uppercase tracking-widest mb-6">
        {timeLeft}s remaining
      </p>

      {/* Player list */}
      <div className="relative z-10 flex-1 space-y-2 max-w-sm w-full mx-auto">
        {alive.map(player => {
          const isMe = player.id === myPlayerId;
          const isTeammate = teammateIds.has(player.id);
          const isSelected = selectedId === player.id;

          return (
            <button
              key={player.id}
              disabled={isMe || submitted}
              onClick={() => handleTap(player.id)}
              className="w-full flex items-center justify-between rounded-xl px-4 py-3.5 border transition-all duration-200 active:scale-[0.98]"
              style={{
                background: isSelected
                  ? 'rgba(197,17,17,0.12)'
                  : isMe
                  ? 'rgba(255,255,255,0.015)'
                  : 'rgba(255,255,255,0.03)',
                borderColor: isSelected
                  ? 'rgba(197,17,17,0.4)'
                  : isMe
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.06)',
                opacity: isMe ? 0.25 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                {/* Subtle mafia teammate dot */}
                <div
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: isTeammate ? 'rgba(180,30,30,0.5)' : 'transparent' }}
                />
                <span
                  className="font-medium text-sm tracking-wide"
                  style={{ color: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)' }}
                >
                  {player.name}{isMe ? ' (you)' : ''}
                </span>
              </div>
              {isSelected && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(197,17,17,0.25)', border: '1px solid rgba(197,17,17,0.5)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(197,17,17,0.9)' }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirm button — appears once a player is selected */}
      <div className="relative z-10 max-w-sm w-full mx-auto pt-5 pb-2">
        {!submitted ? (
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className="w-full py-4 rounded-xl font-bebas text-xl tracking-widest transition-all duration-300 active:scale-[0.97]"
            style={{
              background: selectedId ? 'rgba(197,17,17,0.18)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedId ? 'rgba(197,17,17,0.45)' : 'rgba(255,255,255,0.06)'}`,
              color: selectedId ? 'rgba(255,100,100,0.9)' : 'rgba(255,255,255,0.15)',
              boxShadow: selectedId ? '0 0 20px rgba(197,17,17,0.15)' : 'none',
            }}
          >
            {selectedId ? `Confirm — ${selectedPlayer?.name}` : 'Select a player first'}
          </button>
        ) : (
          <div
            className="w-full py-4 rounded-xl text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-[9px] text-white/20 uppercase tracking-[0.4em]">Waiting for others…</p>
          </div>
        )}
      </div>
    </div>
  );
}
