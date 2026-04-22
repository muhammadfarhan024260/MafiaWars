'use client';

import React, { useState, useEffect } from 'react';

export default function HostDashboard({ roomCode, players, configuration, onUpdateConfig, onStartGame, isGameStarted, onRevealAll, onReset }) {
  const [mafiaCount, setMafiaCount] = useState(configuration?.mafiaCount ?? 1);
  const [doctorCount, setDoctorCount] = useState(configuration?.doctorCount ?? 1);

  useEffect(() => {
    setMafiaCount(configuration?.mafiaCount ?? 1);
    setDoctorCount(configuration?.doctorCount ?? 1);
  }, [configuration]);


  const totalPlayers = players.length;
  const civilianCount = Math.max(0, totalPlayers - mafiaCount - doctorCount);

  const handleMafiaChange = (newCount) => {
    const maxMafia = Math.max(0, totalPlayers - doctorCount);
    const updated = Math.min(Math.max(0, newCount), maxMafia);
    setMafiaCount(updated);
    onUpdateConfig(updated, doctorCount);
  };

  const handleDoctorChange = (newCount) => {
    const maxDoctor = Math.max(0, totalPlayers - mafiaCount);
    const updated = Math.min(Math.max(0, newCount), maxDoctor);
    setDoctorCount(updated);
    onUpdateConfig(mafiaCount, updated);
  };

  return (
    <div className="min-h-[100dvh] p-6 sm:p-8 animate-reveal">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-bebas text-white tracking-widest leading-none">
              NARRATOR <span className="text-red-600">COMMAND</span>
            </h1>
            <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">
              Secure Terminal: <span className="text-white font-mono text-base ml-1 tracking-normal">{roomCode}</span>
            </p>
          </div>
          <div className="glass-card px-8 py-4 text-center border-red-900/30">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Infiltration Strengh</p>
            <p className="text-white text-3xl font-bebas tracking-tighter">{totalPlayers} <span className="text-gray-600 text-lg">Agents</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Players Grid */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bebas text-white tracking-widest uppercase">Live Roster</h2>
              <span className="h-px flex-1 bg-white/10 mx-4 hidden sm:block"></span>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">Secrecy Status: ACTIVE</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.length === 0 ? (
                <div className="glass-card p-12 col-span-full text-center border-dashed border-white/10">
                  <p className="text-gray-600 uppercase tracking-widest text-xs animate-pulse">Waiting for arrivals...</p>
                </div>
              ) : (
                players.map((player) => (
                  <div
                    key={player.id}
                    className="glass-card p-5 group transition-all duration-300 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold tracking-wide">{player.name}</p>
                          {player.isHost && (
                            <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">
                              Host
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">ID: {player.id.slice(0, 8)}</p>
                      </div>
                      
                      {isGameStarted && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black mb-0.5">Role</p>
                          <p className="text-white font-bebas text-lg tracking-wider bg-white/5 px-3 py-1 rounded">
                            {player.role || '???'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Setup & Controls */}
          <div className="lg:col-span-4 h-fit sticky top-8">
            <div className="glass-card overflow-hidden shadow-2xl shadow-black/50 border-white/5">
              <div className="bg-red-600/10 p-6 border-b border-white/10">
                <h2 className="text-xl font-bebas text-white tracking-widest uppercase">Room Protocol</h2>
              </div>
              
              <div className="p-6 space-y-8">
                {!isGameStarted ? (
                  <>
                    <div className="space-y-6">
                      <ConfigRow 
                        label="Mafia Units" 
                        count={mafiaCount} 
                        onChange={handleMafiaChange}
                        color="text-red-500"
                      />
                      <ConfigRow 
                        label="Medical Units" 
                        count={doctorCount} 
                        onChange={handleDoctorChange}
                        color="text-teal-500"
                      />
                      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Civilian Reserve</p>
                        <p className="text-white text-xl font-bebas">{civilianCount}</p>
                      </div>
                    </div>

                    <button
                      onClick={onStartGame}
                      disabled={totalPlayers < 2}
                      className="btn-primary w-full shadow-red-600/10"
                    >
                      Establish Roles
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-green-900/10 border border-green-900/30 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-green-500 text-[10px] uppercase tracking-[0.2em] font-black">Operation Live</p>
                    </div>
                    
                    <button
                      onClick={onRevealAll}
                      className="w-full bg-white hover:bg-gray-200 text-black font-bebas font-bold py-4 rounded-xl transition-all duration-200 shadow-xl shadow-white/5 uppercase tracking-widest text-lg"
                    >
                      Reveal All Identities
                    </button>
                    <button
                      onClick={onReset}
                      className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-4 rounded-xl transition-all duration-200 uppercase text-xs tracking-widest border border-white/5"
                    >
                      Reset Operation
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-[11px] font-medium text-gray-500 tracking-[0.2em] uppercase opacity-50">
                Made with ❤️ by <span className="text-red-500/80">MFarhan</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, count, onChange, color }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black ml-1">
        {label}
      </label>
      <div className="flex items-center justify-between glass-card bg-black/40 p-2 gap-4 border-white/5">
        <button
          onClick={() => onChange(count - 1)}
          className="w-10 h-10 rounded-lg hover:bg-white/5 text-gray-400 transition-colors font-bold text-xl"
        >
          &minus;
        </button>
        <span className={`text-2xl font-bebas tracking-tighter ${color}`}>{count}</span>
        <button
          onClick={() => onChange(count + 1)}
          className="w-10 h-10 rounded-lg hover:bg-white/5 text-gray-400 transition-colors font-bold text-xl"
        >
          +
        </button>
      </div>
    </div>
  );
}

