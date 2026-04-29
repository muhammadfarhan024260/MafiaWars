'use client';

import React from 'react';

const BASE_ROLE_CFG = {
  MAFIA:    { color: '#C51111', light: '#FF4444', bg: 'rgba(197,17,17,0.08)',  border: 'rgba(197,17,17,0.28)'  },
  DOCTOR:   { color: '#11802D', light: '#19C119', bg: 'rgba(25,193,25,0.08)',  border: 'rgba(25,193,25,0.28)'  },
  CIVILIAN: { color: '#132ED2', light: '#4A6FFF', bg: 'rgba(74,111,255,0.08)', border: 'rgba(74,111,255,0.28)' },
  JESTER:   { color: '#D97706', light: '#FCD34D', bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.28)'  },
};

function buildRoleCfg(customRoles = []) {
  const cfg = { ...BASE_ROLE_CFG };
  customRoles.forEach(r => {
    const hex = r.color || '#888888';
    cfg[r.name] = { color: hex, light: hex, bg: `${hex}15`, border: `${hex}48` };
  });
  return cfg;
}

export default function RoleRevelation({ players, onClose, isHost = false, configuration }) {
  const ROLE_CFG = buildRoleCfg(configuration?.customRoles);
  return (
    <div className="min-h-[100dvh] p-4 sm:p-6 animate-reveal">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-4 space-y-1">
          <h1
            className="font-bebas text-5xl sm:text-6xl text-white tracking-widest leading-none"
            style={{ textShadow: '0 0 40px rgba(255,255,255,0.18)' }}
          >
            GAME OVER
          </h1>
          <p className="text-white/25 text-[10px] uppercase tracking-[0.35em]">
            All identities revealed
          </p>
        </div>

        {/* Player cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {players.map((player, i) => {
            const cfg = player.role ? ROLE_CFG[player.role] : null;
            return (
              <div
                key={player.id}
                className="rounded-2xl p-4 border text-center space-y-3 animate-slide-up"
                style={{
                  background:   cfg ? cfg.bg   : 'rgba(255,255,255,0.025)',
                  borderColor:  cfg ? cfg.border : 'rgba(255,255,255,0.07)',
                  animationDelay: `${i * 0.07}s`,
                  animationFillMode: 'both',
                }}
              >
                {/* Character avatar replacement */}
                <div 
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center font-bebas text-2xl border-2 transition-all duration-500"
                  style={{ 
                    background: player.eliminated ? 'rgba(0,0,0,0.4)' : cfg ? `${cfg.color}15` : 'rgba(255,255,255,0.05)',
                    borderColor: player.eliminated ? 'rgba(255,255,255,0.1)' : cfg ? cfg.color : 'rgba(255,255,255,0.1)',
                    color: player.eliminated ? 'rgba(255,255,255,0.1)' : cfg ? cfg.light : 'rgba(255,255,255,0.4)',
                    boxShadow: !player.eliminated && cfg ? `0 0 20px ${cfg.color}44` : 'none',
                  }}
                >
                  {player.role?.[0]?.toUpperCase() || '?'}
                </div>

                <div>
                  <p
                    className={`font-bold text-sm leading-tight ${player.eliminated ? 'text-white/25 line-through' : 'text-white'}`}
                  >
                    {player.name}
                  </p>
                  <p
                    className="font-bebas text-xl tracking-widest mt-0.5"
                    style={{ color: cfg && !player.eliminated ? cfg.light : '#2a2a2a' }}
                  >
                    {player.role || '???'}
                  </p>
                </div>

                {player.eliminated && (
                  <span
                    className="inline-block text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{ color: '#FF4444', borderColor: 'rgba(197,17,17,0.25)', background: 'rgba(197,17,17,0.08)' }}
                  >
                    Eliminated
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="pb-8 text-center">
          <button onClick={onClose} className="btn-primary min-w-[180px]">
            {isHost ? 'Reset & Play Again' : 'Back to Lobby'}
          </button>
        </div>

      </div>
    </div>
  );
}
