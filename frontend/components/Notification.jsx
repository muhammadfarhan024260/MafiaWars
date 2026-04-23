'use client';

import React from 'react';

export default function Notification({ message, onClose, type = 'error' }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-fade-in shadow-2xl">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative glass-card w-full max-w-sm p-8 text-center border-white/5 animate-role-pop shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Icon based on type */}
        <div className="mb-6 flex justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
            type === 'error' ? 'bg-[#FF4444]/10 border-[#FF4444]/20' : 'bg-[#4A6FFF]/10 border-[#4A6FFF]/20'
          }`}>
            {type === 'error' ? (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#4A6FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="font-bebas text-4xl tracking-[0.1em] text-white uppercase">
            {type === 'error' ? 'Transmission Error' : 'System Alert'}
          </h2>
          <p className="text-white/50 text-[13px] leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-xl font-bebas text-xl tracking-widest transition-all active:scale-95 ${
            type === 'error' ? 'bg-[#FF4444] text-white hover:bg-[#FF4444]/90' : 'btn-primary'
          }`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
