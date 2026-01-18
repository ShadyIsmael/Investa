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

      }
    });

    registerEventHandler('receiveMessage', (payload) => {
      try {
        window.dispatchEvent(
          new CustomEvent('investa:signalr:receive-message', { detail: payload })
        );
      } catch (e) {
        // Ignore
      }
    });

    // Support request events
    const handleSupportRequest = (data: any) => {
      try {
        // Filter out probe / handshake events to avoid noise
        const probeCategory = data?.category === 'Probe' || data?.type === 'handshake-probe' || (data?.message && String(data.message).toLowerCase().includes('probe'));
        if (probeCategory) {
          logger.debug('Ignored probe support request', data);
          return;
        }

        // Map incoming fields to the frontend model
        const mapped: Record<string, any> = {
          ...data,
          conversationId: data?.convId ?? data?.conversationId,
          phoneNumber: data?.userMobile ?? data?.phoneNumber,
          message: data?.message ?? data?.text ?? data?.content,
        };

        // Clean null/undefined values to avoid storing nulls in state
        for (const k of Object.keys(mapped)) {
          if (mapped[k] === null || typeof mapped[k] === 'undefined') {
            delete mapped[k];
          }
        }

        // Log the mapped payload for debugging
        console.log('DATA RECEIVED (service - mapped):', mapped);

        // Emit UI event and also show a clickable toast
        window.dispatchEvent(
          new CustomEvent('investa:signalr:receive-support', { detail: mapped })
        );

        // Show toast notification with click handler to open conversation
        try {
          const title = 'New Support Request';
          const body = `New request from ${mapped.phoneNumber || mapped.clientName || 'Unknown'}: ${mapped.message || ''}`;
          const openConversation = () => {
            try {
              if (mapped.conversationId) {
                const path = `/admin/support/chat/${mapped.conversationId}`;
                history.pushState({}, '', path);
                try { window.dispatchEvent(new CustomEvent('investa:navigate', { detail: { path } })); } catch (e) {}
              } else if (mapped.phoneNumber) {
                const path = `/admin/support`;
                history.pushState({}, '', path);
                try { window.dispatchEvent(new CustomEvent('investa:navigate', { detail: { path } })); } catch (e) {}
              }
              window.dispatchEvent(new CustomEvent('investa:ui:open-conversation', { detail: { conversationId: mapped.conversationId } }));
            } catch (e) { /* ignore */ }
          };

          // Dedup / rate-limit logic
          const now = Date.now();
          const keyBase = mapped.conversationId ? `conv:${mapped.conversationId}` : `phone:${mapped.phoneNumber || 'unknown'}`;
          const msgHash = String(mapped.message || '').slice(0, 64);
          const toastKey = `${keyBase}|${msgHash}`;

          // Clean up old timestamps from sliding window
          toastTimestampsRef.current = toastTimestampsRef.current.filter(ts => (now - ts) <= TOAST_RATE_WINDOW);

          // Check global rate limit
          if (toastTimestampsRef.current.length >= MAX_TOASTS_PER_WINDOW) {
            // Optionally show a single suppression notice every SUPPRESSION_TOAST_TTL
            if (!suppressionShownRef.current || (now - suppressionShownRef.current) > SUPPRESSION_TOAST_TTL) {
              toast.warn('Multiple support requests received — some notifications suppressed', { autoClose: 4000 });
              suppressionShownRef.current = now;
            }
            logger.debug('Toast suppressed due to global rate limit', { mapped });
          } else {
            // Check per-key dedupe window
            const last = toastHistoryRef.current[toastKey];
            if (last && (now - last) < TOAST_DEDUPE_TTL) {
              logger.debug('Duplicate toast suppressed for key', toastKey);
            } else {
              // Show the toast and record timestamp
              toast.info(
                (<div onClick={openConversation} style={{ cursor: mapped.conversationId ? 'pointer' : 'default' }}>
                  <div style={{ fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: '13px', marginTop: 4 }}>{body}</div>
                </div>),
                { autoClose: 6000, toastId: mapped.conversationId || `phone:${mapped.phoneNumber || 'unknown'}` }
              );

              toastHistoryRef.current[toastKey] = now;
              toastTimestampsRef.current.push(now);
            }
          }
        } catch (e) {
          logger.debug('Failed to show toast', e);
        }

      } catch (e) {
        // Ignore
      }
    };

    registerEventHandler('ReceiveSupportRequest', handleSupportRequest);
    registerEventHandler('receiveSupportRequest', handleSupportRequest);
    
    // ✅ CRITICAL: Register handler for NewSupportRequest (sent to Admins group)
    // Must match exact case: "NewSupportRequest"
    registerEventHandler('NewSupportRequest', (data) => {
      console.log('🔔 [NewSupportRequest] Raw payload received:', data);
      
      // Critical: Map PascalCase backend fields to frontend camelCase
      const mappedData = {
        id: data.ConversationId || data.conversationId,
        customer: data.CustomerName || data.customerName,
        mobile: data.Phone || data.phone,
        type: data.Category || data.category,
        text: data.InitialMessage || data.initialMessage || data.message,
        date: data.Timestamp || data.timestamp
      };
      
      console.log('📋 [NewSupportRequest] Mapped data:', mappedData);
      
      // Emit UI event for SupportDashboard
      try {
        window.dispatchEvent(
          new CustomEvent('investa:signalr:new-support-request', { detail: mappedData })
        );
        console.log('✅ [NewSupportRequest] Event dispatched to UI');
      } catch (e) {
        console.error('❌ [NewSupportRequest] Failed to dispatch event:', e);
      }
      
      // Also trigger the general support request handler for toast notifications
      handleSupportRequest(data);
    });
    registerEventHandler('newSupportRequest', (payload) => {
      console.log('🔔 newSupportRequest received in service:', payload);
      handleSupportRequest(payload);
    });

    return conn;
  }, []);

  const start = useCallback(async () => {
    if (!connectionRef.current) {
      connectionRef.current = createConnection();
    }
    
    const conn = connectionRef.current!;
    
    if (conn.state === HubConnectionState.Connected || 
        conn.state === HubConnectionState.Connecting) {
      return;
    }

    try {
      setConnectionState('Connecting');
      await conn.start();
      console.log('🔌 SignalR Started! Now attempting to join Admins group...');
      setConnectionState('Connected');
      logger.signalr.connected((conn as any).connectionId);

      // Print connection.state to console for verification
      console.log('📡 SignalR State after start:', conn.state, 'connectionId:', (conn as any).connectionId || null);

      // ✅ CRUCIAL: Join the "Admins" group to receive NewSupportRequest events
      conn.invoke('JoinGroup', 'Admins')
        .then(() => {
          console.log('✅ Successfully joined Admins group - ready to receive events');
          logger.info('Joined Admins group for support request broadcasts');
        })
        .catch(err => {
          console.error('❌ Failed to join Admins group:', err);
          logger.error('Failed to join Admins group', err);
        });

      // Re-register in-memory listeners after reconnection
      for (const [event, handlers] of listenersRef.current.entries()) {
        for (const handler of handlers) {
          conn.on(event, handler);
        }
      }

    } catch (err) {
      console.log('[SignalR] start failed', err);
      logger.signalr.error('Failed to start connection', err);
      setConnectionState('Disconnected');
      throw err;
    }
  }, [createConnection]);

  const stop = useCallback(async () => {
    const conn = connectionRef.current;
    if (!conn) return;

    try {
      await conn.stop();
    } catch (e) {
      logger.warn('SignalR stop error', e);
    } finally {
      try {
        for (const [event, handlers] of listenersRef.current.entries()) {
          for (const handler of handlers) {
            conn.off(event, handler);
          }
        }
      } catch (e) {
        // Ignore
      }
      
      connectionRef.current = null;
      setConnectionState('Disconnected');
      logger.info('SignalR connection stopped');
    }
  }, []);

  const on = useCallback((eventName: string, cb: (...args: any[]) => void) => {
    const set = listenersRef.current.get(eventName) || new Set();
    set.add(cb);
    listenersRef.current.set(eventName, set);
    
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      conn.on(eventName, cb);
    }
  }, []);

  const off = useCallback((eventName: string, cb?: (...args: any[]) => void) => {
    const set = listenersRef.current.get(eventName);
    if (!set) return;
    
    if (cb) {
      set.delete(cb);
    } else {
      set.clear();
    }
    
    if (set.size === 0) {
      listenersRef.current.delete(eventName);
    }
    
    const conn = connectionRef.current;
    if (conn && conn.state === HubConnectionState.Connected) {
      if (cb) {
        conn.off(eventName, cb);
      } else {
        conn.off(eventName);
      }
    }
  }, []);

  // React to auth lifecycle events
  useEffect(() => {
    const handleLogin = () => {
      start().catch(err => {
        logger.error('Failed to start SignalR on login', err);
      });
    };

    const handleLogout = () => {
      stop().catch(() => {});
    };

    const handleMarkAsRead = (e: any) => {
      const conversationId = e?.detail?.conversationId || e?.detail;
      const conn = connectionRef.current;
      
      if (!conversationId) return;
      
      if (conn && conn.state === HubConnectionState.Connected) {
        conn.invoke('MarkAsRead', conversationId).catch(err => {
          logger.warn('MarkAsRead invoke failed', err);
        });
      } else {
        logger.warn('MarkAsRead skipped - not connected');
      }
    };

    window.addEventListener('investa:auth:login', handleLogin as EventListener);
    window.addEventListener('investa:auth:logout', handleLogout as EventListener);
    window.addEventListener('investa:signalr:mark-as-read', handleMarkAsRead as EventListener);

    // Auto-start if already authenticated
    try {
      if (storage.get('is-authenticated') === 'true') {
        start().catch(() => {});
      }
    } catch (e) {
      // Ignore
    }

    const handleBeforeUnload = () => {
      stop().catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('investa:auth:login', handleLogin as EventListener);
      window.removeEventListener('investa:auth:logout', handleLogout as EventListener);
      window.removeEventListener('investa:signalr:mark-as-read', handleMarkAsRead as EventListener);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [start, stop]);

  const value: SignalRContextValue = {
    connection: connectionRef.current,
    connectionState,
    start,
    stop,
    on,
    off,
  };

  return <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>;
};

export const useSignalR = () => {
  const ctx = useContext(SignalRContext);
  if (!ctx) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return ctx;
};

export default SignalRProvider;
