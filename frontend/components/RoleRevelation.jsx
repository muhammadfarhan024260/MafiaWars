'use client';

import React from 'react';

export default function RoleRevelation({ players, onClose }) {
  return (
    <div className="min-h-[100dvh] p-6 sm:p-8 animate-reveal">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-5xl sm:text-6xl font-bebas text-white tracking-widest leading-none">
            FINAL <span className="text-red-600">REVELATION</span>
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-medium">
            Operation concluded. All identities decrypted.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <div
              key={player.id}
              className={`glass-card p-8 border-white/5 transition-all duration-500 ${
                player.role === 'MAFIA' 
                  ? 'bg-red-600/10 border-red-600/30' 
                  : player.role === 'DOCTOR'
                  ? 'bg-teal-600/10 border-teal-600/30'
                  : 'bg-white/5'
              }`}
            >
              <div className="space-y-4 text-center">
                <div className="space-y-1">
                  <p className="text-white font-bold text-xl tracking-tight">{player.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Agent ID: {player.id.slice(0, 8)}</p>
                </div>
                
                <h2 className={`text-4xl font-bebas tracking-widest ${
                  player.role === 'MAFIA' ? 'text-red-500' : 
                  player.role === 'DOCTOR' ? 'text-teal-400' : 'text-gray-400'
                }`}>
                  {player.role}
                </h2>

                {player.eliminated && (
                  <div className="pt-4 mt-4 border-t border-white/5">
                    <span className="text-[10px] bg-red-600/20 text-red-500 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Killed in Action
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 text-center">
          <button
            onClick={onClose}
            className="btn-primary min-w-[200px]"
          >
            Return to Base
          </button>
        </div>
      </div>
    </div>
  );
}

