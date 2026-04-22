'use client';

import React, { useState } from 'react';

export default function RoleReveal({ role, onRevealComplete }) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [displayedRole, setDisplayedRole] = useState(null);

  const handleReveal = () => {
    if (isRevealing) return;

    setIsRevealing(true);
    setDisplayedRole(role);

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setDisplayedRole(null);
      setIsRevealing(false);
      if (onRevealComplete) onRevealComplete();
    }, 1500);

    return () => clearTimeout(timer);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 animate-reveal">
      <div className="w-full max-w-md text-center">
        <div className="space-y-12">
          {/* Header area - changes based on state */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bebas text-white tracking-widest uppercase">
              {displayedRole ? 'IDENTITY' : 'IDENTITY'} <span className="text-red-600">{displayedRole ? 'DECRYPTED' : 'CHECK'}</span>
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-medium">
              {displayedRole ? 'Memorize and conceal immediately' : 'Hold private. Secure your surroundings.'}
            </p>
          </div>

          {/* The Cinematic Token */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className={`glass-card p-12 flex items-center justify-center border-dashed transition-all duration-700 ${displayedRole ? 'border-white/40 scale-110' : 'border-white/20'}`}>
              <button
                onClick={handleReveal}
                disabled={isRevealing}
                className={`w-28 h-28 rounded-full transition-all duration-500 shadow-2xl flex items-center justify-center group relative overflow-hidden ${displayedRole
                    ? 'bg-white shadow-white/20 scale-100'
                    : 'bg-red-600 hover:bg-red-500 active:scale-95 shadow-red-600/40'
                  }`}
              >
                {/* Reveal Content */}
                <div className={`font-bebas text-5xl transition-all duration-500 ${displayedRole ? 'text-black scale-100' : 'text-white scale-0 opacity-0 translate-y-4'}`}>
                  {displayedRole === 'MAFIA' ? 'M' : displayedRole === 'DOCTOR' ? 'D' : 'C'}
                </div>

                {/* Initial Eye Content */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${displayedRole ? 'scale-0 opacity-0 -translate-y-4' : 'scale-100'}`}>
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin hidden group-disabled:block"></div>
                  <span className="text-white font-bebas text-2xl group-disabled:hidden tracking-wider">EYE</span>
                </div>
              </button>
            </div>

            {/* Role Name (scaled for mobile) */}
            <div className={`transition-all duration-700 delay-100 ${displayedRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 className="text-6xl sm:text-8xl font-bebas text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                {displayedRole}
              </h2>

              <div className="mt-6 h-1 bg-white/10 w-32 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-white w-full animate-[shrink_3s_linear_forwards]"></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-loose">
              {displayedRole ? 'Data purging in progress...' : 'Data expires in 3 seconds post-reveal'}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

