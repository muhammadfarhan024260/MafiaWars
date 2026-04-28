'use client';

import React from 'react';

const ROLE_COLORS = {
  MAFIA:    { color: '#C51111', bg: 'rgba(197,17,17,0.12)',  border: 'rgba(197,17,17,0.3)' },
  DOCTOR:   { color: '#12A64A', bg: 'rgba(18,166,74,0.12)', border: 'rgba(18,166,74,0.3)' },
  CIVILIAN: { color: '#4A6FFF', bg: 'rgba(74,111,255,0.08)', border: 'rgba(74,111,255,0.2)' },
};

function getRoleStyle(role) {
  return ROLE_COLORS[role] ?? { color: '#888888', bg: 'rgba(136,136,136,0.08)', border: 'rgba(136,136,136,0.2)' };
}

export default function GameOverScreen({ winner, players, onPlayAgain, onLeave }) {
  const isMafiaWin = winner === 'MAFIA';

  return (
    <div className="min-h-[100dvh] flex flex-col items-center p-6 animate-reveal relative overflow-hidden">

      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-72 pointer-events-none"
        style={{
          background: isMafiaWin
            ? 'radial-gradient(ellipse at top, rgba(197,17,17,0.12) 0%, transparent 65%)'
            : 'radial-gradient(ellipse at top, rgba(74,111,255,0.10) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm pt-10 space-y-8">

        {/* Winner banner */}
        <div className="text-center space-y-1">
          <p className="text-[9px] uppercase tracking-[0.5em]" style={{ color: isMafiaWin ? 'rgba(197,17,17,0.5)' : 'rgba(74,111,255,0.5)' }}>
            {isMafiaWin ? 'The shadows win' : 'Justice prevails'}
          </p>
          <h1
            className="font-bebas leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 20vw, 6rem)',
              color: isMafiaWin ? '#C51111' : '#4A6FFF',
              textShadow: isMafiaWin
                ? '0 0 40px rgba(197,17,17,0.4), 0 0 80px rgba(197,17,17,0.2)'
                : '0 0 40px rgba(74,111,255,0.4), 0 0 80px rgba(74,111,255,0.2)',
            }}
          >
            {isMafiaWin ? 'MAFIA' : 'CIVILIANS'}
          </h1>
          <p className="text-white/25 text-xs uppercase tracking-widest">WIN</p>
        </div>

        {/* Full role reveal */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-4 text-center">Roles Revealed</p>
          <div className="space-y-2">
            {players.map(p => {
              const { color, bg, border } = getRoleStyle(p.role);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl border"
                  style={{ background: bg, borderColor: border }}
                >
                  <div className="flex items-center gap-2">
                    {p.eliminated && (
                      <span className="text-[10px] text-white/20">☠</span>
                    )}
                    <span
                      className="text-sm font-medium"
                      style={{ color: p.eliminated ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)', textDecoration: p.eliminated ? 'line-through' : 'none' }}
                    >
                      {p.name}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                    style={{ color, background: `${color}15` }}
                  >
                    {p.role ?? '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pb-6">
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all"
              style={{
                background: isMafiaWin ? 'rgba(197,17,17,0.15)' : 'rgba(74,111,255,0.15)',
                color: isMafiaWin ? '#C51111' : '#4A6FFF',
                border: `1px solid ${isMafiaWin ? 'rgba(197,17,17,0.3)' : 'rgba(74,111,255,0.3)'}`,
              }}
            >
              Play Again
            </button>
          )}
          <button
            onClick={onLeave}
            className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white/25 border border-white/5 hover:text-white/50 transition-all"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
