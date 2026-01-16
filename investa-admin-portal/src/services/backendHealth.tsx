import React, { useEffect, useState } from 'react';

const POLL_INTERVAL = 15000; // 15s

/**
 * Polls the API health endpoint and emits window events:
 * - `investa:backend:reachable` when healthy
 * - `investa:backend:unreachable` when unreachable
 *
 * This runs in development to show an indicator and help debugging.
 */
export const BackendHealthMonitor: React.FC = () => {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    let timer: any;

    const check = async () => {
      try {
        // Use the local proxy path so the dev server proxies correctly to the backend
        const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        if (!mounted) return;
        if (res.ok) {
          if (!online) {
            setOnline(true);
            try { window.dispatchEvent(new CustomEvent('investa:backend:reachable', { detail: { url: '/api/health' } })); } catch (e) { /* ignore */ }
          }
        } else {
          if (online) {
            setOnline(false);
            try { window.dispatchEvent(new CustomEvent('investa:backend:unreachable', { detail: { url: '/api/health', status: res.status } })); } catch (e) { /* ignore */ }
          }
        }
      } catch (err: any) {
        if (!mounted) return;
        if (online) {
          setOnline(false);
          try { window.dispatchEvent(new CustomEvent('investa:backend:unreachable', { detail: { url: '/api/health', message: err?.message || String(err) } })); } catch (e) { /* ignore */ }
        }
      } finally {
        timer = setTimeout(check, POLL_INTERVAL);
      }
    };

    // Start immediately
    check();

    return () => { mounted = false; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // Invisible component; UI listens to events
};

export default BackendHealthMonitor;
