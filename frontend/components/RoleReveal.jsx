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
    }, 3000);

    return () => clearTimeout(timer);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 animate-reveal">
      <div className="w-full max-w-md text-center">
        {!displayedRole ? (
          <div className="space-y-12">
            <div className="space-y-4">
              <h1 className="text-5xl font-bebas text-white tracking-widest uppercase">
                IDENTITY <span className="text-red-600">CHECK</span>
              </h1>
              <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-medium">
                Hold private. Secure your surroundings.
              </p>
            </div>

            <div className="glass-card p-12 flex items-center justify-center border-dashed border-white/20">
              <button
                onClick={handleReveal}
                disabled={isRevealing}
                className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 active:scale-90 transition-all duration-300 shadow-2xl shadow-red-600/40 flex items-center justify-center group disabled:opacity-50"
              >
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin hidden group-disabled:block"></div>
                <span className="text-white font-bebas text-2xl group-disabled:hidden">EYE</span>
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                Data expires in 3 seconds post-reveal
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-reveal space-y-8">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm uppercase tracking-[0.4em] font-bold">
                Assigned Identity:
              </p>
              <h2 className="text-8xl sm:text-9xl font-bebas text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                {displayedRole}
              </h2>
            </div>
            
            <div className="h-1 bg-white/10 w-48 mx-auto rounded-full overflow-hidden">
              <div className="h-full bg-white w-full animate-[shrink_3s_linear_forwards]"></div>
            </div>
            
            <p className="text-gray-600 text-[10px] uppercase tracking-widest animate-pulse">
              Memorize and conceal...
            </p>
          </div>
        )}
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

