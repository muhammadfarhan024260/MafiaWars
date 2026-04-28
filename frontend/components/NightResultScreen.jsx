'use client';

import React from 'react';

export default function NightResultScreen({ eliminated, saved }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 animate-reveal relative overflow-hidden">

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: eliminated
            ? 'radial-gradient(ellipse at center, rgba(197,17,17,0.07) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at center, rgba(34,120,60,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 text-center space-y-6 max-w-xs w-full">

        {eliminated ? (
          <>
            <div className="space-y-1">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.45em]">Tonight's Victim</p>
              <h1 className="font-bebas text-6xl text-white/80 tracking-widest leading-none">
                {eliminated.name}
              </h1>
              <p className="text-white/20 text-xs uppercase tracking-widest mt-2">was found dead at dawn</p>
            </div>
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center border"
              style={{ background: 'rgba(197,17,17,0.08)', borderColor: 'rgba(197,17,17,0.2)' }}
            >
              <span className="text-3xl select-none">☠</span>
            </div>
          </>
        ) : saved ? (
          <>
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center border"
              style={{ background: 'rgba(34,120,60,0.08)', borderColor: 'rgba(34,120,60,0.2)' }}
            >
              <span className="text-3xl select-none">🛡</span>
            </div>
            <div className="space-y-1">
              <h1 className="font-bebas text-5xl text-white/80 tracking-widest leading-none">ALL SAFE</h1>
              <p className="text-white/20 text-xs uppercase tracking-widest">The Doctor saved someone tonight</p>
            </div>
          </>
        ) : (
          <>
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <span className="text-3xl select-none">🌑</span>
            </div>
            <div className="space-y-1">
              <h1 className="font-bebas text-5xl text-white/80 tracking-widest leading-none">QUIET NIGHT</h1>
              <p className="text-white/20 text-xs uppercase tracking-widest">No one was targeted tonight</p>
            </div>
          </>
        )}

        <p className="text-[9px] text-white/15 uppercase tracking-[0.4em] pt-4">Day phase begins shortly…</p>
      </div>
    </div>
  );
}
