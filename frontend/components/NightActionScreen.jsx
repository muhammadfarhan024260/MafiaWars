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
    const next = playerId === selectedId ? null : playerId;
    setSelectedId(next);
    if (next) {
      setSubmitted(true);
      onSubmit(next);
    }
  };

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
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Choose a player</p>
      </div>

      {/* Timer bar */}
      <div className="relative z-10 w-full h-0.5 rounded-full overflow-hidden mb-8" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000 linear"
          style={{
            width: `${progress * 100}%`,
            background: progress > 0.4 ? 'rgba(255,255,255,0.3)' : 'rgba(197,17,17,0.7)',
          }}
        />
      </div>

      {/* Timer label */}
      <p className="relative z-10 text-center text-[10px] text-white/20 uppercase tracking-widest mb-6 -mt-6">
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
                  ? 'rgba(197,17,17,0.35)'
                  : isMe
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(255,255,255,0.06)',
                opacity: (submitted && !isSelected) || isMe ? 0.35 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                {/* Subtle mafia teammate dot — barely visible from distance */}
                <div
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{
                    background: isTeammate ? 'rgba(180,30,30,0.5)' : 'transparent',
                  }}
                />
                <span
                  className="font-medium text-sm tracking-wide"
                  style={{ color: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)' }}
                >
                  {player.name}{isMe ? ' (you)' : ''}
                </span>
              </div>
              {isSelected && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(197,17,17,0.25)', border: '1px solid rgba(197,17,17,0.4)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(197,17,17,0.8)' }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Submitted state footer */}
      {submitted && (
        <div className="relative z-10 text-center pt-6 pb-2">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.4em]">Choice submitted — waiting for others</p>
        </div>
      )}
    </div>
  );
}
