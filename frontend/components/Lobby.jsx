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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 sm:p-8 animate-reveal">
      <div className="w-full max-w-md space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-6xl sm:text-7xl font-bebas text-white tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
            MAFIA <span className="text-red-600">WARS</span>
          </h1>
          <p className="text-gray-500 font-medium tracking-[0.2em] text-xs uppercase">
            Digital Narrator & Role Dealer
          </p>
        </div>

        <div className="glass-card p-2 flex mb-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 text-sm uppercase tracking-wider ${
              activeTab === 'create'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 text-sm uppercase tracking-wider ${
              activeTab === 'join'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            Join
          </button>
        </div>

        <div className="glass-card p-6 sm:p-8 transition-all duration-500">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">
                  Narrator Name
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="The Godfather"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !createName.trim()}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? 'Establishing...' : 'Initialize Room'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">
                  4-Digit Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="0000"
                  maxLength="4"
                  className="input-field text-center text-3xl font-bebas tracking-[0.5em] h-16"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">
                  Character Name
                </label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Agent 47"
                  className="input-field"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || joinCode.length !== 4 || !joinName.trim()}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isLoading ? 'Infiltrating...' : 'Join the Ranks'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">
            Secrecy is paramount.<br/>
            Keep your device hidden after reveal.
          </p>
        </div>
      </div>
    </div>
  );
}

