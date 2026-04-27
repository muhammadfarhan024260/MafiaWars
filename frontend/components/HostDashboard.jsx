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
  onRevealAll, onReset, onEliminate, onShield, onKick, onLeave,
  pendingHostSwitch, onAcceptSwitch, onDeclineSwitch,
}) {
  const [mafiaCount,  setMafiaCount]  = useState(configuration?.mafiaCount  ?? 1);
  const [doctorCount, setDoctorCount] = useState(configuration?.doctorCount ?? 0);
  const [customRoles, setCustomRoles] = useState((configuration?.customRoles ?? []).map(r => ({ ...r })));
  const [newRoleName, setNewRoleName] = useState('');
  const [kickConfirm, setKickConfirm] = useState(null); // { id, name }

  useEffect(() => {
    setMafiaCount(configuration?.mafiaCount   ?? 1);
    setDoctorCount(configuration?.doctorCount ?? 0);
    setCustomRoles((configuration?.customRoles ?? []).map(r => ({ ...r })));
  }, [configuration]);

  const total       = players.length;
  const customTotal = customRoles.reduce((s, r) => s + r.count, 0);
  const civCount    = Math.max(0, total - mafiaCount - doctorCount - customTotal);
  const alive       = players.filter(p => !p.eliminated).length;

  const handleMafia = (n) => {
    const v = Math.min(Math.max(0, n), Math.max(0, total - doctorCount - customTotal));
    setMafiaCount(v);
  };
  const handleDoctor = (n) => {
    const v = Math.min(Math.max(0, n), Math.max(0, total - mafiaCount - customTotal));
    setDoctorCount(v);
  };
  const handleCustomRole = (index, n) => {
    const otherCustomTotal = customRoles.reduce((s, r, i) => i !== index ? s + r.count : s, 0);
    const v = Math.min(Math.max(0, n), Math.max(0, total - mafiaCount - doctorCount - otherCustomTotal));
    setCustomRoles(prev => prev.map((r, i) => i === index ? { ...r, count: v } : r));
  };
  const addCustomRole = () => {
    const name = newRoleName.trim().toUpperCase();
    if (!name) return;
    if (customRoles.some(r => r.name === name)) return;
    setCustomRoles(prev => [...prev, { name, count: 0 }]);
    setNewRoleName('');
  };
  const removeCustomRole = (index) => {
    setCustomRoles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = () => onUpdateConfig(mafiaCount, doctorCount, customRoles);

  const handleStart = () => {
    onUpdateConfig(mafiaCount, doctorCount, customRoles);
    onStartGame();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 sm:p-6 overflow-x-hidden animate-reveal">
      <div className="max-w-2xl mx-auto w-full space-y-6">

        {/* ── Host Switch Banner ── */}
        {pendingHostSwitch && (
          <div className="glass-card p-4 border-[#4A6FFF]/30 bg-[#4A6FFF]/10 flex items-center justify-between animate-role-pop">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4A6FFF]/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A6FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Transfer Request</p>
                <p className="text-xs text-white">
                  <span className="font-bold text-[#4A6FFF]">{pendingHostSwitch.name}</span> wants to be the Narrator
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onAcceptSwitch(pendingHostSwitch.userId)}
                className="px-3 py-1.5 rounded-lg bg-[#4A6FFF] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#4A6FFF]/80 transition-all"
              >
                Approve
              </button>
              <button 
                onClick={onDeclineSwitch}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Deny
              </button>
            </div>
          </div>
        )}

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="font-bebas text-5xl sm:text-6xl text-white tracking-widest leading-none">DASHBOARD</h1>
              <span className="px-3 py-1 rounded-full bg-impostor text-[10px] font-bold tracking-widest uppercase">Room: {roomCode}</span>
            </div>
            <p className="text-white/20 text-[10px] uppercase font-bold tracking-[0.4em]">Narrator Control Center</p>
          </div>
          <div className="flex items-center gap-6 border-l border-white/5 pl-6">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mb-1">Alive</p>
              <p className="font-bebas text-3xl leading-none text-white">{alive}<span className="text-white/10 text-xl">/{total}</span></p>
            </div>
            <button 
              onClick={onLeave}
              className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white/30 border border-white/5 hover:bg-white/5 hover:text-white transition-all"
            >
              Leave
            </button>
          </div>
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Player Roster */}
          <div className="lg:col-span-7 space-y-4">
            <SectionHeader title="Active Players" />
            
            <div className="grid grid-cols-1 gap-2">
              {players.length === 0 ? (
                <div className="py-12 glass-card text-center border-dashed border-white/5">
                  <p className="text-white/10 text-xs uppercase tracking-[0.3em] font-medium italic">Waiting for agents to join...</p>
                </div>
              ) : (
                players.map((player) => {
                  const rc = player.role ? ROLE[player.role] : null;
                  return (
                    <div
                      key={player.id}
                      className="glass-card p-3 flex items-center justify-between group transition-all duration-300 hover:bg-white/[0.07]"
                      style={{
                        borderColor: rc && !player.eliminated ? `${rc.hex}33` : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Name row */}
                      <div className="flex items-center gap-2 flex-1">
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
                          <p className={`font-bold text-sm leading-tight truncate ${player.eliminated ? 'text-white/20 line-through' : 'text-white'}`}>
                            {player.name}
                          </p>
                          {player.eliminated && (
                            <p className="text-[8px] text-[#FF4444] uppercase tracking-widest font-bold mt-0.5">
                              Eliminated
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
                          className="ml-2 px-2 text-center text-[8px] font-bold uppercase tracking-widest rounded-lg py-0.5 border"
                          style={{ color: '#19C119', borderColor: 'rgba(25,193,25,0.25)', background: 'rgba(25,193,25,0.08)' }}
                        >
                          Shielded
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30">Game Settings</p>
              </div>

              {!isGameStarted ? (
                <div className="p-5 space-y-6">
                  <div className="space-y-4">
                    <CountControl label="Mafia" count={mafiaCount} onChange={handleMafia} color="white" />
                    <CountControl label="Doctor" count={doctorCount} onChange={handleDoctor} color="white" />

                    {/* Custom roles */}
                    {customRoles.map((role, i) => (
                      <div key={role.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeCustomRole(i)}
                            className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-[#FF4444] hover:bg-[#FF4444]/10 transition-all font-bold text-sm leading-none"
                          >
                            ×
                          </button>
                          <span className="text-[10px] text-white/35 uppercase tracking-widest font-bold">{role.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleCustomRole(i, role.count - 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 font-bold text-lg flex items-center justify-center transition-colors active:scale-90">−</button>
                          <span className="font-bebas text-2xl w-5 text-center text-white">{role.count}</span>
                          <button onClick={() => handleCustomRole(i, role.count + 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 font-bold text-xl flex items-center justify-center transition-colors active:scale-90">+</button>
                        </div>
                      </div>
                    ))}

                    {/* Add custom role */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        value={newRoleName}
                        onChange={e => setNewRoleName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomRole()}
                        placeholder="New role name..."
                        maxLength={20}
                        className="flex-1 bg-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white/60 placeholder-white/20 border border-white/10 focus:outline-none focus:border-white/20 uppercase tracking-widest"
                      />
                      <button
                        onClick={addCustomRole}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[10px] text-white/15 uppercase tracking-widest font-medium">Civilians (Auto)</span>
                      <span className="font-bebas text-xl text-white/30">{civCount}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleUpdate}
                      className="w-full py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-white/40 border border-white/5 hover:bg-white/5 hover:text-white transition-all"
                    >
                      Update Configuration
                    </button>
                  </div>

                  <button
                    onClick={handleStart}
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
