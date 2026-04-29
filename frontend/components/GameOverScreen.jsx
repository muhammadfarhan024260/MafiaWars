'use client';

import React from 'react';

const ROLE_COLORS = {
  MAFIA:    { color: '#C51111', bg: 'rgba(197,17,17,0.12)',  border: 'rgba(197,17,17,0.3)'  },
  DOCTOR:   { color: '#12A64A', bg: 'rgba(18,166,74,0.12)', border: 'rgba(18,166,74,0.3)'  },
  CIVILIAN: { color: '#4A6FFF', bg: 'rgba(74,111,255,0.08)', border: 'rgba(74,111,255,0.2)' },
  JESTER:   { color: '#FCD34D', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.3)'  },
};

function getRoleStyle(role) {
  return ROLE_COLORS[role] ?? { color: '#888888', bg: 'rgba(136,136,136,0.08)', border: 'rgba(136,136,136,0.2)' };
}

const WINNER_CFG = {
  MAFIA:     { color: '#C51111', glow: 'rgba(197,17,17,0.4)', bg: 'rgba(197,17,17,0.12)', label: 'MAFIA',     tagline: 'The shadows win' },
  CIVILIANS: { color: '#4A6FFF', glow: 'rgba(74,111,255,0.4)', bg: 'rgba(74,111,255,0.10)', label: 'CIVILIANS', tagline: 'Justice prevails' },
  JESTER:    { color: '#FCD34D', glow: 'rgba(252,211,77,0.4)',  bg: 'rgba(217,119,6,0.10)',  label: 'JESTER',    tagline: 'The fool had the last laugh' },
};

export default function GameOverScreen({ winner, players, onPlayAgain, onLeave }) {
  const cfg = WINNER_CFG[winner] ?? WINNER_CFG.CIVILIANS;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center p-6 animate-reveal relative overflow-hidden">

      {/* Background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-72 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${cfg.bg} 0%, transparent 65%)` }}
      />

      <div className="relative z-10 w-full max-w-sm pt-10 space-y-8">

        {/* Winner banner */}
        <div className="text-center space-y-1">
          <p className="text-[9px] uppercase tracking-[0.5em]" style={{ color: cfg.color + '80' }}>
            {cfg.tagline}
          </p>
          <h1
            className="font-bebas leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 20vw, 6rem)',
              color: cfg.color,
              textShadow: `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow}55`,
            }}
          >
            {cfg.label}
          </h1>
          <p className="text-white/25 text-xs uppercase tracking-widest">
            {winner === 'JESTER' ? 'WINS' : 'WIN'}
          </p>
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
                background: `${cfg.color}26`,
                color: cfg.color,
                border: `1px solid ${cfg.color}4D`,
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
