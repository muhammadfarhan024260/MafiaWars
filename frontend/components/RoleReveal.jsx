'use client';

import React, { useState } from 'react';

const ROLE_CFG = {
  MAFIA: {
    color:  '#FFFFFF',
    light:  '#FFFFFF',
    glow:   'rgba(255,255,255,0.65)',
    bg:     'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 65%)',
    label:  'MAFIA',
    sub:    'Eliminate the crew. Stay hidden.',
  },
  DOCTOR: {
    color:  '#FFFFFF',
    light:  '#FFFFFF',
    glow:   'rgba(255,255,255,0.65)',
    bg:     'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 65%)',
    label:  'DOCTOR',
    sub:    'Protect the innocent. One per night.',
  },
  CIVILIAN: {
    color:  '#FFFFFF',
    light:  '#FFFFFF',
    glow:   'rgba(255,255,255,0.65)',
    bg:     'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 65%)',
    label:  'CIVILIAN',
    sub:    'Find the Mafia. Vote them out.',
  },
};

function buildCfg(role) {
  if (!role) return null;
  if (ROLE_CFG[role]) return ROLE_CFG[role];
  // Custom roles use the same all-white style as built-in roles
  // so a screen flash never reveals the role to bystanders
  return {
    color: '#FFFFFF',
    light: '#FFFFFF',
    glow:  'rgba(255,255,255,0.65)',
    bg:    'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 65%)',
    label: role,
    sub:   'Play your role wisely.',
  };
}

export default function RoleReveal({ role, onRevealComplete, configuration }) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (revealed) return;
    setRevealed(true);
    setTimeout(() => {
      setRevealed(false);
      if (onRevealComplete) onRevealComplete();
    }, 1500);
  };

  const cfg = buildCfg(role);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden animate-reveal">

      {/* Role glow overlay — animates in on reveal */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ background: cfg?.bg ?? 'none', opacity: revealed ? 1 : 0 }}
      />

      {/* Default dark vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
          opacity: revealed ? 0 : 1,
          transition: 'opacity 0.5s',
        }}
      />

      <div className="relative z-10 w-full max-w-xs text-center space-y-8">

        {!revealed ? (
          /* ── Pre-reveal state ── */
          <>
            <div className="space-y-1">
              <h1 className="font-bebas text-4xl text-white/70 tracking-widest">YOUR ROLE</h1>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.35em]">
                Keep your screen private
              </p>
            </div>

            {/* Tap button */}
            <button
              onClick={handleReveal}
              className="mx-auto block group relative"
              aria-label="Reveal role"
            >
              <div
                className="w-44 h-44 rounded-full flex items-center justify-center border border-white/8 transition-all duration-300 group-hover:border-white/15 group-active:scale-95"
                style={{ background: 'rgba(255,255,255,0.025)' }}
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center border border-white/8 animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="font-bebas text-white/50 text-xl tracking-widest">TAP</span>
                  </div>
                </div>
              </div>
            </button>

            <p className="text-[9px] text-white/15 uppercase tracking-[0.4em]">
              Visible for 1.5 seconds only
            </p>
          </>
        ) : (
          /* ── Revealed state ── */
          <>
            {/* Role Icon Replacement */}
            <div className="animate-role-pop flex justify-center">
              <div 
                className="w-28 h-28 rounded-full flex items-center justify-center font-bebas text-6xl border-4 transition-all duration-500"
                style={{ 
                  background: `${cfg.color}15`,
                  borderColor: cfg.color,
                  color: cfg.light,
                  boxShadow: `0 0 40px ${cfg.glow}, inset 0 0 20px ${cfg.glow}`,
                }}
              >
                {cfg.label?.[0]?.toUpperCase()}
              </div>
            </div>

            {/* Role name */}
            <div className="animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
              <h2
                className="font-bebas leading-none"
                style={{
                  fontSize: 'clamp(3.5rem, 20vw, 6.5rem)',
                  color: cfg.light,
                  textShadow: `0 0 30px ${cfg.glow}, 0 0 70px ${cfg.glow}55`,
                }}
              >
                {cfg.label}
              </h2>
              <p className="text-white/35 text-xs mt-2 tracking-wider">{cfg.sub}</p>
            </div>

            {/* Countdown bar */}
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full animate-count-down"
                style={{ background: cfg.light }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
