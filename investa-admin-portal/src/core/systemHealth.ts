import { useEffect, useState } from 'react';

export type SystemHealth = 'healthy' | 'degraded' | 'unavailable';

export function interpretHealthResponse(httpOk: boolean, payload: unknown): SystemHealth {
  if (!httpOk) return 'unavailable';
  const status = typeof payload === 'object' && payload !== null && 'status' in payload
    ? String((payload as { status?: unknown }).status || '').toLowerCase()
    : '';
  if (status === 'degraded') return 'degraded';
  if (status === 'unavailable' || status === 'unhealthy') return 'unavailable';
  return 'healthy';
}

export function useSystemHealth(): SystemHealth {
  const [health, setHealth] = useState<SystemHealth>('healthy');

  useEffect(() => {
    const down = () => setHealth('unavailable');
    const up = () => setHealth('healthy');
    const degraded = () => setHealth('degraded');
    window.addEventListener('investa:backend:unreachable', down);
    window.addEventListener('investa:backend:reachable', up);
    window.addEventListener('investa:backend:degraded', degraded);
    return () => {
      window.removeEventListener('investa:backend:unreachable', down);
      window.removeEventListener('investa:backend:reachable', up);
      window.removeEventListener('investa:backend:degraded', degraded);
    };
  }, []);

  return health;
}

