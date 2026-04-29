'use client';

import React from 'react';

export default function PlayerScreen({ players, roomCode, onLeave, onRequestHost }) {
  const [showRequestConfirm, setShowRequestConfirm] = React.useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 animate-reveal relative">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(74,111,255,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-sm text-center space-y-8">

        {/* Pulsing state indicator */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-25" />
            <div className="relative w-full h-full bg-white/5 border border-white/10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="space-y-2">
          <h1 className="font-bebas text-5xl text-white tracking-widest leading-none">
            STAND BY
          </h1>
          <p className="text-white/25 text-xs uppercase tracking-[0.3em] leading-relaxed">
            Waiting for the narrator to begin
          </p>
          {roomCode && (
            <p className="text-[10px] uppercase tracking-[0.35em] font-bold" style={{ color: 'rgba(255,255,255,0.15)' }}>
              Room: <span style={{ color: 'rgba(255,255,255,0.35)' }}>{roomCode}</span>
            </p>
          )}
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

        <div className="pt-4">
          <button 
            onClick={onLeave}
            className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/30 border border-white/5 hover:bg-white/5 hover:text-white transition-all"
          >
            Leave Game
          </button>
          <button 
            onClick={() => setShowRequestConfirm(true)}
            className="block mx-auto mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#4A6FFF]/40 hover:text-[#4A6FFF] transition-colors"
          >
            Request to be Narrator
          </button>
        </div>
      </div>

      {/* ── Request Confirmation Modal ── */}
      {showRequestConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in shadow-2xl">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRequestConfirm(false)} />
          <div className="relative glass-card w-full max-w-xs p-6 space-y-6 text-center border-white/5 animate-role-pop">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#4A6FFF]/10 border border-[#4A6FFF]/20 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A6FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="font-bebas text-3xl tracking-widest text-white">NARRATOR TRANSFER</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                Are you sure you want to request control as the <span className="text-[#4A6FFF] font-bold">Narrator</span>?
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  onRequestHost();
                  setShowRequestConfirm(false);
                }}
                className="w-full py-3 bg-[#4A6FFF] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(74,111,255,0.3)]"
              >
                Send Request
              </button>
              <button
                onClick={() => setShowRequestConfirm(false)}
                className="w-full py-3 text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
