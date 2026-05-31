/**
 * Centralized API Service
 * Handles all HTTP requests with dynamic URL resolution
 */

import { logger } from '../utils/logger';
import { getDynamicBaseUrl, storage } from '../utils/environment';

const DEFAULT_BASE_URL = getDynamicBaseUrl();

// Initialize BASE_URL with dynamic resolution
let BASE_URL: string = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  const stored = storage.get('apiBaseUrl');
  if (stored) return stored;

  return DEFAULT_BASE_URL;
})();

// Persist chosen BASE_URL
storage.set('apiBaseUrl', BASE_URL);

// Mock mode management
let USE_MOCKS: boolean = (() => {
  const stored = storage.get('useMocks');
  if (stored !== null) return stored !== 'false';
  
  const envUse = import.meta.env.VITE_USE_MOCKS;
  return typeof envUse !== 'undefined' ? envUse === 'true' : true;
})();

// API configuration functions
export function setBaseUrl(url: string): void {
  const normalized = (url || '').replace(/\/+$/, '');
  BASE_URL = normalized || DEFAULT_BASE_URL;
  storage.set('apiBaseUrl', BASE_URL);
}

export function getBaseUrl(): string {
  return BASE_URL || DEFAULT_BASE_URL;
}

export function setUseMocks(val: boolean): void {
  USE_MOCKS = val;
  storage.set('useMocks', String(val));
}

// Auth token management
let authToken: string | null = storage.get('token');

export function setAuthToken(token: string | null, persist = true): void {
  authToken = token;
  if (persist && token) {
    storage.set('token', token);
  } else {
    storage.remove('token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// Custom API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Simulate delay for mock data
const simulateDelay = (ms = 800): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// Build complete URL from endpoint
function buildUrl(endpoint: string): string {
  if (!endpoint) return endpoint;
  
  // If endpoint is already absolute, return it
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  
  const base = (BASE_URL || '').replace(/\/+$/, '');

  // Handle API routes
  if (endpoint.startsWith('/api/')) {
    if (/^https?:\/\//i.test(base)) {
      // Avoid duplicated '/api'
      if (/\/api$/i.test(base)) {
        return `${base}${endpoint.replace(/^\/api/, '')}`;
      }
      return `${base}${endpoint}`;
    }
    return endpoint;
  }

  // For other root-relative endpoints
  if (endpoint.startsWith('/')) return `${base}${endpoint}`;
  
  const ep = (endpoint || '').replace(/^\/+/, '');
  return `${base}/${ep}`;
}

// Emit global events for auth and connection issues
function emitUnauthorizedEvent(message: string): void {
  try {
    window.dispatchEvent(
      new CustomEvent('investa:unauthorized', {
        detail: { status: 401, message }
      })
    );
  } catch (e) {
    // Ignore errors
  }
}

function emitBackendUnreachableEvent(endpoint: string, message: string): void {
  try {
    window.dispatchEvent(
      new CustomEvent('investa:backend:unreachable', {
        detail: { endpoint, message }
      })
    );
  } catch (e) {
    // Ignore errors
  }
}

// Core API methods
export const api = {
  async get<T>(endpoint: string, mockData?: T): Promise<T> {
    logger.api.request('GET', endpoint);

    if (USE_MOCKS && mockData !== undefined) {
      await simulateDelay();
      return mockData;
    }

    try {
      const resolved = buildUrl(endpoint);
      logger.debug(`API GET resolved URL: ${resolved}`);

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      let response: Response;
      
      try {
        response = await fetch(resolved, { headers, cache: 'no-store' });
      } catch (err) {
        // Retry via dev proxy if direct request fails
        if (resolved.startsWith('http') && endpoint.startsWith('/api/')) {
          logger.warn('Direct request failed, retrying via dev proxy');
          response = await fetch(endpoint, { headers, cache: 'no-store' });
        } else {
          throw err;
        }
      }

      logger.api.response('GET', endpoint, response.status);

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        let msg = text;
        try {
          const parsed = JSON.parse(text);
          msg = parsed?.message || text;
        } catch {
          // Not JSON
        }

        if (response.status === 401) {
          emitUnauthorizedEvent(msg);
        }

        throw new ApiError(response.status, `Failed to fetch: ${msg}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json() as T;
      }

      const text = await response.text();
      return text as unknown as T;

    } catch (error: any) {
      logger.api.error('GET', endpoint, error);
      emitBackendUnreachableEvent(endpoint, error?.message || String(error));

      // 🚨 BACKEND UNREACHABLE: Fall back to mock data if available
      if (mockData !== undefined) {
        logger.warn(`Backend unreachable for ${endpoint}, falling back to mock data`);
        await simulateDelay(200); // Short delay to simulate network
        return mockData;
      }

      if (error instanceof ApiError) throw error;
      throw new ApiError(0, error?.message || String(error));
    }
  },

  async post<T>(endpoint: string, body: any, mockData?: T): Promise<T> {
    logger.api.request('POST', endpoint, body);

    if (USE_MOCKS && mockData !== undefined) {
      await simulateDelay();
      return mockData;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const resolved = buildUrl(endpoint);
      logger.debug(`API POST resolved URL: ${resolved}`);

      let response: Response;

      try {
        response = await fetch(resolved, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });
      } catch (err) {
        // Retry via dev proxy if direct request fails
        if (resolved.startsWith('http') && endpoint.startsWith('/api/')) {
          logger.warn('Direct POST failed, retrying via dev proxy');
          response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          });
        } else {
          throw err;
        }
      }

      logger.api.response('POST', endpoint, response.status);

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        let msg = text;
        try {
          const parsed = JSON.parse(text);
          msg = parsed?.message || text;
        } catch {
          // Not JSON
        }

        if (response.status === 401) {
          emitUnauthorizedEvent(msg);
        }

        throw new ApiError(response.status, `POST failed: ${msg}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json() as T;
      }

      const text = await response.text();
      return text as unknown as T;

    } catch (error: any) {
      logger.api.error('POST', endpoint, error);
      emitBackendUnreachableEvent(endpoint, error?.message || String(error));

      // 🚨 BACKEND UNREACHABLE: Fall back to mock data if available
      if (mockData !== undefined) {
        logger.warn(`Backend unreachable for POST ${endpoint}, falling back to mock data`);
        await simulateDelay(200);
        return mockData;
      }

      if (error instanceof ApiError) throw error;
      throw new ApiError(0, error?.message || String(error));
    }
  },

  async put<T>(endpoint: string, body: any, mockData?: T): Promise<T> {
    logger.api.request('PUT', endpoint, body);

    if (USE_MOCKS && mockData !== undefined) {
      await simulateDelay();
      return mockData;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const resolved = buildUrl(endpoint);
      const response = await fetch(resolved, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      logger.api.response('PUT', endpoint, response.status);

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new ApiError(response.status, `PUT failed: ${text}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json() as T;
      }

      const text = await response.text();
      return text as unknown as T;

    } catch (error: any) {
      logger.api.error('PUT', endpoint, error);

      // 🚨 BACKEND UNREACHABLE: Fall back to mock data if available
      if (mockData !== undefined) {
        logger.warn(`Backend unreachable for PUT ${endpoint}, falling back to mock data`);
        await simulateDelay(200);
        return mockData;
      }

      if (error instanceof ApiError) throw error;
      throw new ApiError(0, error?.message || String(error));
    }
  },

  async delete<T>(endpoint: string, mockData?: T): Promise<T> {
    logger.api.request('DELETE', endpoint);

    if (USE_MOCKS && mockData !== undefined) {
      await simulateDelay();
      return mockData;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const resolved = buildUrl(endpoint);
      const response = await fetch(resolved, {
        method: 'DELETE',
        headers,
      });

      logger.api.response('DELETE', endpoint, response.status);

      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new ApiError(response.status, `DELETE failed: ${text}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json() as T;
      }

      const text = await response.text();
      return text as unknown as T;

    } catch (error: any) {
      logger.api.error('DELETE', endpoint, error);

      // 🚨 BACKEND UNREACHABLE: Fall back to mock data if available
      if (mockData !== undefined) {
        logger.warn(`Backend unreachable for DELETE ${endpoint}, falling back to mock data`);
        await simulateDelay(200);
        return mockData;
      }

      if (error instanceof ApiError) throw error;
      throw new ApiError(0, error?.message || String(error));
    }
  }
};
