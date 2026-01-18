/**
 * SignalR Stub
 * Removed real SignalR dependency and replaced with a small no-op stub to keep APIs stable.
 */

import React, { createContext, useContext } from 'react';

export type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting';

interface SignalRContextValue {
  connection: null;
  connectionState: ConnectionState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  on: (eventName: string, cb: (...args: any[]) => void) => void;
  off: (eventName: string, cb?: (...args: any[]) => void) => void;
}

const defaultValue: SignalRContextValue = {
  connection: null,
  connectionState: 'Disconnected',
  start: async () => {},
  stop: async () => {},
  on: () => {},
  off: () => {}
};

const SignalRContext = createContext<SignalRContextValue>(defaultValue);

export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <SignalRContext.Provider value={defaultValue}>{children}</SignalRContext.Provider>;
};

export function useSignalR() {
  return useContext(SignalRContext);
}

export default SignalRProvider;

