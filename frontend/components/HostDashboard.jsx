'use client';

import React, { useState, useEffect } from 'react';

const ROLE = {
  MAFIA:    { hex: '#C51111', light: '#FF4444', bg: 'rgba(197,17,17,0.1)',  border: 'rgba(197,17,17,0.3)'  },
  DOCTOR:   { hex: '#11802D', light: '#19C119', bg: 'rgba(25,193,25,0.1)',  border: 'rgba(25,193,25,0.3)'  },
  CIVILIAN: { hex: '#132ED2', light: '#4A6FFF', bg: 'rgba(74,111,255,0.1)', border: 'rgba(74,111,255,0.3)' },
};

export default function HostDashboard({
  roomCode, players, configuration,
  onUpdateConfig, onStartGame, isGameStarted,
  onRevealAll, onReset, onEliminate, onShield, onKick,
}) {
  const [mafiaCount,  setMafiaCount]  = useState(configuration?.mafiaCount  ?? 1);
  const [doctorCount, setDoctorCount] = useState(configuration?.doctorCount ?? 0);
  const [kickConfirm, setKickConfirm] = useState(null); // { id, name }

  useEffect(() => {
    setMafiaCount(configuration?.mafiaCount   ?? 1);
    setDoctorCount(configuration?.doctorCount ?? 0);
  }, [configuration]);

  const total    = players.length;
  const civCount = Math.max(0, total - mafiaCount - doctorCount);
  const alive    = players.filter(p => !p.eliminated).length;

  const handleMafia = (n) => {
    const v = Math.min(Math.max(0, n), Math.max(0, total - doctorCount));
    setMafiaCount(v);
    onUpdateConfig(v, doctorCount);
  };
  const handleDoctor = (n) => {
    const v = Math.min(Math.max(0, n), Math.max(0, total - mafiaCount));
    setDoctorCount(v);
    onUpdateConfig(mafiaCount, v);
  };

  return (
    <div className="min-h-[100dvh] p-4 sm:p-6 animate-reveal">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-widest leading-none">
              MISSION <span className="text-impostor">CONTROL</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/25 text-[10px] uppercase tracking-widest">Room</span>
              <span className="font-bebas text-2xl text-white tracking-widest">{roomCode}</span>
              {isGameStarted && (
                <span
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full border"
                  style={{ color: '#19C119', borderColor: 'rgba(25,193,25,0.25)', background: 'rgba(25,193,25,0.08)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-medic-light animate-pulse" />
                  Live
                </span>
              )}
            </div>
          </div>
          <div
            className="rounded-xl px-4 py-2.5 text-center min-w-[68px] border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <p className="font-bebas text-3xl text-white leading-none">{total}</p>
            <p className="text-[9px] text-white/25 uppercase tracking-widest">Players</p>
          </div>
        </div>

        {/* ── Stats bar (game live) ── */}
        {isGameStarted && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Alive',   value: alive,                                                                    color: '#fff'    },
              { label: 'Mafia',   value: players.filter(p => !p.eliminated && p.role === 'MAFIA').length,    color: '#FF4444' },
              { label: 'Doctor',  value: players.filter(p => !p.eliminated && p.role === 'DOCTOR').length,   color: '#19C119' },
              { label: 'Civilian',value: players.filter(p => !p.eliminated && p.role === 'CIVILIAN').length, color: '#4A6FFF' },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-2.5 text-center border"
                style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p className="font-bebas text-2xl leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Player grid ── */}
          <div className="lg:col-span-2 space-y-3">
            <SectionHeader title="Crew Roster" />

            {total === 0 ? (
              <div
                className="rounded-2xl p-10 text-center border border-dashed"
                style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              >
                <p className="text-white/20 text-[10px] uppercase tracking-widest animate-pulse">
                  Waiting for players to join…
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {players.map((player) => {
                  const rc = player.role ? ROLE[player.role] : null;
                  return (
                    <div
                      key={player.id}
                      className={`rounded-xl p-3 border transition-all duration-300 ${player.eliminated ? 'opacity-35' : ''}`}
                      style={{
                        background:   rc ? rc.bg   : 'rgba(255,255,255,0.025)',
                        borderColor:  rc ? rc.border : 'rgba(255,255,255,0.07)',
                      }}
                    >
                      {/* Name row */}
                      <div className="flex items-center gap-2">
                        {/* Simple initial-based avatar */}
                        <div 
                          className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-bebas text-sm border"
                          style={{ 
                            background: player.eliminated ? 'rgba(0,0,0,0.2)' : rc ? `${rc.hex}22` : 'rgba(255,255,255,0.05)',
                            borderColor: player.eliminated ? 'rgba(255,255,255,0.05)' : rc ? rc.border : 'rgba(255,255,255,0.1)',
                            color: player.eliminated ? 'rgba(255,255,255,0.1)' : rc ? rc.light : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {player.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate leading-tight ${player.eliminated ? 'line-through text-white/25' : 'text-white'}`}>
                            {player.name}
                          </p>
                          {isGameStarted && (
                            <p
                              className="font-bebas text-sm tracking-wider leading-tight mt-0.5"
                              style={{ color: rc && !player.eliminated ? rc.light : '#3a3a3a' }}
                            >
                              {player.role || '???'}
                            </p>
                          )}
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={() => setKickConfirm({ id: player.id, name: player.name })}
                          className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-white/20 hover:text-[#FF4444] hover:bg-[#FF4444]/10 transition-all border border-transparent hover:border-[#FF4444]/30"
                        >
                          Kick
                        </button>
                      </div>

                      {/* Shield badge */}
                      {player.shielded && (
                        <div
                          className="mt-1.5 text-center text-[8px] font-bold uppercase tracking-widest rounded-lg py-0.5 border"
                          style={{ color: '#19C119', borderColor: 'rgba(25,193,25,0.25)', background: 'rgba(25,193,25,0.08)' }}
                        >
                          Shielded
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Controls ── */}
          <div className="space-y-3">
            <SectionHeader title="Controls" />

            <div
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              {!isGameStarted ? (
                <div className="p-5 space-y-5">
                  <div className="space-y-4">
                    <CountControl label="Mafia"   count={mafiaCount}  onChange={handleMafia}  color="#FF4444" />
                    <CountControl label="Doctor"  count={doctorCount} onChange={handleDoctor} color="#19C119" />
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Civilians</span>
                      <span className="font-bebas text-2xl text-crewmate-light">{civCount}</span>
                    </div>
                  </div>

                  <button
                    onClick={onStartGame}
                    disabled={total < 2}
                    className="btn-primary w-full text-base py-3.5"
                  >
                    Start Game
                  </button>
                  {total < 2 && (
                    <p className="text-center text-[9px] text-white/20 uppercase tracking-widest -mt-2">
                      Need at least 2 players
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <button
                    onClick={onRevealAll}
                    className="w-full py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm bg-white text-black hover:bg-white/90 active:scale-95 transition-all duration-200"
                    style={{ boxShadow: '0 0 30px rgba(255,255,255,0.12)' }}
                  >
                    Reveal All Roles
                  </button>
                  <button
                    onClick={onReset}
                    className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs text-white/30 border border-white/6 hover:bg-white/5 active:scale-95 transition-all duration-200"
                  >
                    Reset Game
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* ── Kick Confirmation Modal ── */}
        {kickConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in shadow-2xl">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setKickConfirm(null)} />
            <div className="relative glass-card w-full max-w-xs p-6 space-y-6 text-center border-white/5 animate-role-pop">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-full bg-impostor/10 border border-impostor/20 flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="18" y1="8" x2="23" y2="13"></line>
                    <line x1="23" y1="8" x2="18" y2="13"></line>
                  </svg>
                </div>
                <h3 className="font-bebas text-3xl tracking-widest text-white">REMOVING PLAYER</h3>
                <p className="text-white/50 text-xs leading-relaxed">
                  Are you sure you want to remove <span className="text-white font-bold">{kickConfirm.name}</span> from the game?
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onKick && onKick(kickConfirm.id);
                    setKickConfirm(null);
                  }}
                  className="w-full btn-primary py-3 text-xs"
                >
                  Confirm Kick
                </button>
                <button
                  onClick={() => setKickConfirm(null)}
                  className="w-full py-3 text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-white/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-bebas text-base text-white/40 tracking-widest uppercase whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

function CountControl({ label, count, onChange, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-white/35 uppercase tracking-widest font-bold">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(count - 1)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 font-bold text-lg flex items-center justify-center transition-colors active:scale-90"
        >
          −
        </button>
        <span className="font-bebas text-2xl w-5 text-center" style={{ color }}>{count}</span>
        <button
          onClick={() => onChange(count + 1)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 font-bold text-xl flex items-center justify-center transition-colors active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}
