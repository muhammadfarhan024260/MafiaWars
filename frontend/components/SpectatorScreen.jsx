'use client';

import React from 'react';

export default function SpectatorScreen({ players, currentPhase, dayVotes = {} }) {
  const alive = players.filter(p => !p.eliminated);
  const eliminated = players.filter(p => p.eliminated);

  const tally = {};
  Object.values(dayVotes).forEach(tid => { tally[tid] = (tally[tid] || 0) + 1; });

  return (
    <div className="min-h-[100dvh] flex flex-col p-6 animate-reveal relative overflow-hidden">

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(197,17,17,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 pt-4 pb-6 text-center space-y-1">
        <h1 className="font-bebas text-4xl text-white/40 tracking-widest leading-none">ELIMINATED</h1>
        <p className="text-[9px] text-white/15 uppercase tracking-[0.4em]">
          {currentPhase === 'night' ? 'Night is falling — watch and wait' : 'Watch the vote unfold'}
        </p>
      </div>

      {/* Alive players */}
      <div className="relative z-10 max-w-sm w-full mx-auto space-y-4">
        <div
          className="rounded-2xl p-4 border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3">
            {alive.length} Alive
          </p>
          <div className="space-y-2">
            {alive.map(p => {
              const votes = tally[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="text-sm text-white/60">{p.name}</span>
                  {currentPhase === 'day' && votes > 0 && (
                    <span className="text-[10px] text-white/30 font-mono">{votes} vote{votes !== 1 ? 's' : ''}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {eliminated.length > 0 && (
          <div
            className="rounded-2xl p-4 border"
            style={{ background: 'rgba(197,17,17,0.04)', borderColor: 'rgba(197,17,17,0.08)' }}
          >
            <p className="text-[9px] text-white/15 uppercase tracking-widest mb-3">
              {eliminated.length} Eliminated
            </p>
            <div className="flex flex-wrap gap-2">
              {eliminated.map(p => (
                <span
                  key={p.id}
                  className="text-xs px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(197,17,17,0.06)', color: 'rgba(255,68,68,0.35)', textDecoration: 'line-through' }}
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
