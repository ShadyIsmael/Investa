/**
 * Custom Authentication Hook
 * Manages authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { setAuthToken, ADMIN_AUTHENTICATED_KEY } from '../services/api';
import { storage } from '../utils/environment';

export interface UseAuthReturn {
  isAuthenticated: boolean;
  login: (redirect?: string) => void;
  logout: () => void;
}

export function useAuth(onRedirect?: (path: string) => void): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return storage.get(ADMIN_AUTHENTICATED_KEY) === 'true';
  });

  useEffect(() => {
    storage.set(ADMIN_AUTHENTICATED_KEY, String(isAuthenticated));
  }, [isAuthenticated]);

  const login = useCallback((redirect?: string) => {
    setIsAuthenticated(true);
    if (redirect && onRedirect) {
      onRedirect(redirect);
    }
    
    // Emit login event for SignalR and other listeners
    try {
      window.dispatchEvent(new CustomEvent('investa:auth:login'));
    } catch (e) {
      // Ignore
    }
  }, [onRedirect]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setAuthToken(null);
    storage.remove(ADMIN_AUTHENTICATED_KEY);
    
    // Emit logout event for SignalR and other listeners
    try {
      window.dispatchEvent(new CustomEvent('investa:auth:logout'));
    } catch (e) {
      // Ignore
    }
  }, []);

  // Listen for global unauthorized events
  useEffect(() => {
    const handler = () => {
      logout();
    };
    
    window.addEventListener('investa:unauthorized', handler as EventListener);
    
    return () => {
      window.removeEventListener('investa:unauthorized', handler as EventListener);
    };
  }, [logout]);

  return { isAuthenticated, login, logout };
}
