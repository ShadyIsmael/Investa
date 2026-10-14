import React, { useEffect, useRef } from 'react';
import { interpretHealthResponse, type SystemHealth } from '@/core/systemHealth';

const POLL_INTERVAL = 15000; // 15s

/**
 * Polls the API health endpoint and emits window events:
 * - `investa:backend:reachable` when healthy
 * - `investa:backend:degraded` when the API is reachable but a dependency is degraded
 * - `investa:backend:unreachable` when unreachable
 *
 * This runs in development to show an indicator and help debugging.
 */
export const BackendHealthMonitor: React.FC = () => {
  const lastStatus = useRef<SystemHealth>('healthy');

  useEffect(() => {
    let mounted = true;
    let timer: any;

    const check = async () => {
      try {
        // Use the local proxy path so the dev server proxies correctly to the backend
        const res = await fetch('/api/health', { method: 'GET', cache: 'no-store' });
        if (!mounted) return;
        const payload = await res.json().catch(() => undefined);
        const status = interpretHealthResponse(res.ok, payload);
        if (lastStatus.current !== status) {
          lastStatus.current = status;
          const eventName = status === 'healthy'
            ? 'investa:backend:reachable'
            : status === 'degraded' ? 'investa:backend:degraded' : 'investa:backend:unreachable';
          try { window.dispatchEvent(new CustomEvent(eventName, { detail: { url: '/api/health', status: res.status } })); } catch (e) { /* ignore */ }
        }
      } catch (err: any) {
        if (!mounted) return;
        if (lastStatus.current !== 'unavailable') {
          lastStatus.current = 'unavailable';
          try { window.dispatchEvent(new CustomEvent('investa:backend:unreachable', { detail: { url: '/api/health', message: err?.message || 'API unavailable' } })); } catch (e) { /* ignore */ }
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
