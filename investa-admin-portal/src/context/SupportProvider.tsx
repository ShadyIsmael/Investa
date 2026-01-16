/**
 * SupportProvider
 * Exposes high-level support state (SignalR connection status, host info)
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useSignalR } from '../services/signalr';

export type SupportConnectionStatus = 'Connected' | 'Connecting' | 'Disconnected' | 'Reconnecting';

interface SupportContextValue {
  connectionStatus: SupportConnectionStatus;
  host: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SupportContext = createContext<SupportContextValue | undefined>(undefined);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connectionState, start, stop } = useSignalR();
  const [connectionStatus, setConnectionStatus] = useState<SupportConnectionStatus>('Disconnected');

  useEffect(() => {
    // Map service state to provider state (they are the same shape but keep this layer for separation)
    if (connectionState === 'Connected') setConnectionStatus('Connected');
    else if (connectionState === 'Connecting') setConnectionStatus('Connecting');
    else if (connectionState === 'Reconnecting') setConnectionStatus('Reconnecting');
    else setConnectionStatus('Disconnected');
  }, [connectionState]);

  const host = useMemo(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    return hostname.includes('.') ? hostname : `${hostname}.local`;
  }, []);

  const connect = useCallback(async () => {
    try {
      await start();
    } catch (e) {
      // ignore - the signalR service will log
    }
  }, [start]);

  const disconnect = useCallback(async () => {
    try { await stop(); } catch (e) { /* ignore */ }
  }, [stop]);

  return (
    <SupportContext.Provider value={{ connectionStatus, host, connect, disconnect }}>
      {children}
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error('useSupport must be used within a SupportProvider');
  return ctx;
};
