import { describe, expect, it } from 'vitest';
import { interpretHealthResponse } from './systemHealth';

describe('system health interpretation', () => {
  it('keeps a reachable healthy API healthy', () => {
    expect(interpretHealthResponse(true, { status: 'Healthy' })).toBe('healthy');
  });

  it('distinguishes dependency degradation from API unavailability', () => {
    expect(interpretHealthResponse(true, { status: 'Degraded' })).toBe('degraded');
    expect(interpretHealthResponse(false, undefined)).toBe('unavailable');
  });
});
