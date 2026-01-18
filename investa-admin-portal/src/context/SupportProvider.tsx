/**
 * SupportProvider
 * Exposes high-level support state (SignalR connection status, host info)
 */
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

export type SupportConnectionStatus = 'Connected' | 'Connecting' | 'Disconnected' | 'Reconnecting';

interface SupportContextValue {
  connectionStatus: SupportConnectionStatus;
  host: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const SupportContext = createContext<SupportContextValue | undefined>(undefined);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SignalR has been removed; provide a lightweight, no-op provider to preserve API
  const [connectionStatus, setConnectionStatus] = useState<SupportConnectionStatus>('Disconnected');

  const host = useMemo(() => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    return hostname.includes('.') ? hostname : `${hostname}.local`;
  }, []);

  const connect = useCallback(async () => {
    // no-op
    setConnectionStatus('Connected');
  }, []);

  const disconnect = useCallback(async () => {
    // no-op
    setConnectionStatus('Disconnected');
  }, []);

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
