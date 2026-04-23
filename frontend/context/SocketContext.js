'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_CONFIG } from '@/lib/config';
import { getOrCreateUserId, loadSession } from '@/lib/session';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket]           = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId]           = useState(null);

  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);

    const newSocket = io(API_CONFIG.SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => setIsConnected(false));

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, userId }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
