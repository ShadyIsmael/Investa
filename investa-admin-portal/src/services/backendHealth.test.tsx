import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BackendHealthMonitor from './backendHealth';

describe('backend health monitor', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reports a reachable degraded dependency without converting it into an outage', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'Degraded' }),
    });
    const degraded = vi.fn();
    const unreachable = vi.fn();
    window.addEventListener('investa:backend:degraded', degraded);
    window.addEventListener('investa:backend:unreachable', unreachable);

    const { unmount } = render(<BackendHealthMonitor />);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(degraded).toHaveBeenCalledTimes(1);
    expect(unreachable).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    unmount();
    window.removeEventListener('investa:backend:degraded', degraded);
    window.removeEventListener('investa:backend:unreachable', unreachable);
  });

  it('keeps polling after a core API failure so the existing recovery path remains active', async () => {
    fetchMock.mockRejectedValue(new Error('API unavailable'));
    const unreachable = vi.fn();
    window.addEventListener('investa:backend:unreachable', unreachable);

    const { unmount } = render(<BackendHealthMonitor />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(unreachable).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(unreachable).toHaveBeenCalledTimes(1);

    unmount();
    window.removeEventListener('investa:backend:unreachable', unreachable);
  });
});
