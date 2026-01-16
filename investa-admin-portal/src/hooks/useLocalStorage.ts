/**
 * Custom Local Storage Hook
 * Provides a React-friendly interface to localStorage with type safety
 */

import { useState, useEffect } from 'react';
import { storage } from '../utils/environment';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = storage.get(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    }
    return initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    storage.set(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}
