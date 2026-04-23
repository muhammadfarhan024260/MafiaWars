'use client';

import React, { useState } from 'react';

export default function Lobby({ onRoomCreated, onJoinRoom }) {
  const [activeTab, setActiveTab] = useState('create');
  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setIsLoading(true);
    try {
      await onRoomCreated(createName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinName.trim()) return;
    setIsLoading(true);
    try {
      await onJoinRoom(joinCode.trim(), joinName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative">
      {/* Ambient red glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(197,17,17,0.12) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm space-y-7 relative z-10">

        {/* ── Title ── */}
        <div className="text-center space-y-1">
          <h1
            className="font-bebas text-6xl text-white leading-none tracking-tight"
            style={{ textShadow: '0 0 40px rgba(197,17,17,0.55)' }}
          >
            MAFIA <span className="text-impostor">WARS</span>
          </h1>
          <p className="text-white/25 text-[10px] uppercase tracking-[0.35em] font-medium">
            Digital Role Dealer
          </p>
        </div>

        {/* ── Tab switcher ── */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-1 flex">
          {['create', 'join'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300"
              style={
                activeTab === tab
                  ? { background: '#C51111', color: '#fff', boxShadow: '0 0 20px rgba(197,17,17,0.45)' }
                  : { color: 'rgba(255,255,255,0.3)' }
              }
            >
              {tab === 'create' ? 'Create Room' : 'Join Room'}
            </button>
          ))}
        </div>

        {/* ── Form card ── */}
        <div
          className="border border-white/10 rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.03)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
        >
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateRoom} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold block">
                  Narrator Name
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Enter your name..."
                  className="input-field"
                  disabled={isLoading}
                  maxLength={20}
                  autoComplete="off"
                />
              </div>
              <button type="submit" disabled={isLoading || !createName.trim()} className="btn-primary w-full">
                {isLoading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold block">
                  Room Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="- - - -"
                  maxLength={4}
                  className="input-field text-center font-bebas text-4xl tracking-[0.65em] placeholder:tracking-[0.65em]"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold block">
                  Your Name
                </label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Enter your name..."
                  className="input-field"
                  disabled={isLoading}
                  maxLength={20}
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || joinCode.length !== 4 || !joinName.trim()}
                className="btn-primary w-full"
              >
                {isLoading ? 'Joining...' : 'Join Game'}
              </button>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-[9px] text-white/15 uppercase tracking-[0.3em]">
          Keep your role screen private &nbsp;·&nbsp; Made by <span className="text-impostor/50">MFarhan</span>
        </p>
      </div>
    </div>
  );
}
