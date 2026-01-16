/**
 * Custom Theme Hook
 * Manages theme state and persistence
 */

import { useState, useEffect } from 'react';
import { storage } from '../utils/environment';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (storage.get('portal-theme') as Theme) || 'light';
  });

  useEffect(() => {
    storage.set('portal-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
}
