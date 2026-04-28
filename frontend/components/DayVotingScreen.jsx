'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function DayVotingScreen({
  players,
  myPlayerId,
  isSpectator,
  dayVotes = {},
  timerSeconds,
  roundNumber,
  onVote,
}) {
  const [voted, setVoted] = useState(false);
  const [myVote, setMyVote] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const timerRef = useRef(null);

  const alive = players.filter(p => !p.eliminated);

  useEffect(() => {
    setTimeLeft(timerSeconds);
    setVoted(false);
    setMyVote(null);
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

  const handleVote = (targetId) => {
    if (voted || isSpectator) return;
    setVoted(true);
    setMyVote(targetId);
    onVote(targetId);
  };

  // Tally votes
  const tally = {};
  Object.values(dayVotes).forEach(tid => { tally[tid] = (tally[tid] || 0) + 1; });
  const maxVotes = Math.max(0, ...Object.values(tally));

  const progress = timeLeft / timerSeconds;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 animate-reveal relative overflow-hidden">

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(74,111,255,0.06) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="relative z-10 pt-4 pb-4 text-center space-y-1">
        <p className="text-[9px] text-white/20 uppercase tracking-[0.45em]">Round {roundNumber}</p>
        <h1 className="font-bebas text-5xl text-white/80 tracking-widest leading-none">VOTE</h1>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
          {isSpectator ? 'Spectating — you cannot vote' : voted ? 'Vote cast — watching results' : 'Tap to vote someone out'}
        </p>
      </div>

      {/* Timer */}
      <div className="relative z-10 flex items-center gap-3 mb-6">
        <div className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000 linear"
            style={{
              width: `${progress * 100}%`,
              background: progress > 0.4 ? 'rgba(74,111,255,0.5)' : 'rgba(197,17,17,0.7)',
            }}
          />
        </div>
        <span className="text-[10px] text-white/25 font-mono w-10 text-right">{timeLabel}</span>
      </div>

      {/* Player vote list */}
      <div className="relative z-10 flex-1 space-y-2 max-w-sm w-full mx-auto">
        {alive.map(player => {
          const isMe = player.id === myPlayerId;
          const voteCount = tally[player.id] || 0;
          const isMyVoteTarget = myVote === player.id;
          const barWidth = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0;

          return (
            <button
              key={player.id}
              disabled={isMe || voted || isSpectator}
              onClick={() => handleVote(player.id)}
              className="relative w-full rounded-xl border overflow-hidden transition-all duration-200 active:scale-[0.98]"
              style={{
                background: isMyVoteTarget ? 'rgba(197,17,17,0.1)' : 'rgba(255,255,255,0.03)',
                borderColor: isMyVoteTarget ? 'rgba(197,17,17,0.3)' : 'rgba(255,255,255,0.06)',
                opacity: (voted && !isMyVoteTarget && !isSpectator) || isMe ? 0.4 : 1,
              }}
            >
              {/* Vote progress bar underneath */}
              {voteCount > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-xl transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    background: 'rgba(197,17,17,0.06)',
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div className="relative flex items-center justify-between px-4 py-3.5">
                <span
                  className="font-medium text-sm tracking-wide"
                  style={{ color: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.75)' }}
                >
                  {player.name}{isMe ? ' (you)' : ''}
                </span>
                <div className="flex items-center gap-2">
                  {voteCount > 0 && (
                    <span className="text-[10px] text-white/30 font-mono">{voteCount}</span>
                  )}
                  {isMyVoteTarget && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(197,17,17,0.25)', border: '1px solid rgba(197,17,17,0.4)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(197,17,17,0.8)' }} />
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isSpectator && (
        <div className="relative z-10 text-center pt-6 pb-2">
          <p className="text-[9px] text-white/15 uppercase tracking-[0.4em]">You are watching as a spectator</p>
        </div>
      )}
    </div>
  );
}
