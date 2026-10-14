import { describe, expect, it } from 'vitest';
import { normalizeApiBaseUrl, validateApiConfiguration } from './environment';

describe('environment API configuration', () => {
  it('normalizes trailing slashes', () => {
    expect(normalizeApiBaseUrl(' https://api.example.test/api/// ')).toBe('https://api.example.test/api');
  });

  it('rejects localhost API origins in UAT and production', () => {
    expect(validateApiConfiguration('uat', 'http://localhost:5235/api')).toContain('uat cannot use a localhost API base URL.');
    expect(validateApiConfiguration('production', 'http://127.0.0.1:5235/api')).toContain('production cannot use a localhost API base URL.');
  });

  it('allows an unset base URL in development because the Vite proxy is authoritative', () => {
    expect(validateApiConfiguration('development', '')).toEqual([]);
  });
});
