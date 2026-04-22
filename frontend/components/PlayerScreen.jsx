'use client';

import React from 'react';

export default function PlayerScreen({ players, isHost, onRevealAll, onReset }) {
  if (!isHost) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-8 animate-reveal">
        <div className="text-center space-y-8 max-w-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600/20 blur-3xl rounded-full"></div>
            <div className="relative glass-card p-12 border-white/10">
              <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bebas text-white tracking-widest uppercase">
              STAND BY <span className="text-red-600">AGENT</span>
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] leading-relaxed">
              The Narrator is finalizing the operation parameters. Keep your identity concealed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for Host (They should normally see HostDashboard, but this keeps the component robust)
  return (
    <div className="min-h-[100dvh] p-6 sm:p-8 animate-reveal">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-bebas text-white tracking-widest leading-none">
            OPERATION <span className="text-red-600">OVERVIEW</span>
          </h1>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
            Live Roster Tracking
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="glass-card p-6 border-white/5 bg-white/[0.02]"
            >
              <div className="flex justify-between items-center">
                <p className="text-white font-bold tracking-wide">{player.name}</p>
                <div className="flex gap-2">
                  {player.eliminated && (
                    <span className="text-[8px] border border-red-600 text-red-600 font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                      Inactive
                    </span>
                  )}
                  {!player.eliminated && (
                    <span className="text-[8px] border border-green-600 text-green-600 font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRevealAll}
            className="flex-1 bg-white text-black font-bebas font-bold py-4 rounded-xl transition-all hover:bg-gray-200 uppercase tracking-widest"
          >
            Reveal All
          </button>
          <button
            onClick={onReset}
            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-4 rounded-xl transition-all uppercase text-xs tracking-widest border border-white/5"
          >
            Reset
          </button>
        </div>
        <div className="pt-12 text-center">
          <p className="text-[11px] font-medium text-gray-500 tracking-[0.2em] uppercase opacity-50">
            Made with ❤️ by <span className="text-red-500/80">MFarhan</span>
          </p>
        </div>
      </div>
    </div>
  );
}

