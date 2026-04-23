'use client';

import React from 'react';
import Crewmate from './Crewmate';

export default function PlayerScreen({ players }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 animate-reveal relative">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(74,111,255,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-sm text-center space-y-8">

        {/* Bouncing crewmate */}
        <div className="flex justify-center">
          <Crewmate
            color="#333"
            size={90}
            className="animate-crew-bounce"
            style={{ filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.06))' }}
          />
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h1 className="font-bebas text-5xl text-white tracking-widest leading-none">
            STAND BY
          </h1>
          <p className="text-white/25 text-xs uppercase tracking-[0.3em] leading-relaxed">
            Waiting for the narrator to begin
          </p>
        </div>

        {/* Player list */}
        {players.length > 0 && (
          <div
            className="rounded-2xl p-4 border"
            style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <p className="text-[9px] text-white/20 uppercase tracking-widest mb-3 font-bold">
              {players.length} Player{players.length !== 1 ? 's' : ''} in Room
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {players.map((p) => (
                <span
                  key={p.id}
                  className="text-xs px-3 py-1 rounded-lg font-medium"
                  style={
                    p.eliminated
                      ? { background: 'rgba(197,17,17,0.08)', color: 'rgba(255,68,68,0.4)', textDecoration: 'line-through' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }
                  }
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
