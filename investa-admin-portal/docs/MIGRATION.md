# Migration Guide: Refactored Architecture

## Overview
This guide helps you migrate existing code to use the new refactored architecture.

## Quick Reference

### Import Path Changes

| Old Import | New Import | Status |
|------------|-----------|---------|
| `./services/api` | `./src/services/api` or `./src/services` | ✅ Old path still works (re-exported) |
| `./services/signalr` | `./src/services/signalr` or `./src/services` | ✅ Old path still works (re-exported) |
| `./types` | `./src/types` | ✅ Old path still works (re-exported) |
| `./constants` | `./src/utils/constants` | ✅ Old path still works (re-exported) |

### New Utilities

```typescript
// Logger (replaces console.log)
import { logger } from './src/utils/logger';

logger.info('User logged in', user);
logger.error('Failed to fetch', error);
logger.api.request('GET', '/api/users');
logger.signalr.connected(connectionId);

// Environment utilities
import { getDynamicBaseUrl, getDynamicHubUrl, storage } from './src/utils/environment';

const apiUrl = getDynamicBaseUrl();
const hubUrl = getDynamicHubUrl('/chathub');

storage.set('key', 'value');
const value = storage.get('key');

// Custom hooks
import { useAuth, useTheme, useLocalStorage } from './src/hooks';

const { isAuthenticated, login, logout } = useAuth();
const { theme, toggleTheme } = useTheme();
const [value, setValue] = useLocalStorage('key', defaultValue);
```

## Step-by-Step Migration

### 1. Update Console.log Statements

**Before:**
```typescript
console.log('Fetching users...');
console.error('Error:', error);
```

**After:**
```typescript
import { logger } from './src/utils/logger';

logger.info('Fetching users...');
logger.error('Error occurred', error);
```

### 2. Replace Direct localStorage Access

**Before:**
```typescript
const token = localStorage.getItem('token');
localStorage.setItem('token', newToken);
```

**After:**
```typescript
import { storage } from './src/utils/environment';

const token = storage.get('token');
storage.set('token', newToken);
```

### 3. Use Custom Hooks for State Management

**Before:**
```typescript
const [theme, setTheme] = useState(() => {
  return localStorage.getItem('theme') || 'light';
});

useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);
```

**After:**
```typescript
import { useTheme } from './src/hooks';

const { theme, setTheme, toggleTheme } = useTheme();
```

### 4. Update Authentication Logic

**Before:**
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);

const handleLogin = () => {
  setIsAuthenticated(true);
  localStorage.setItem('is-authenticated', 'true');
};

const handleLogout = () => {
  setIsAuthenticated(false);
  setAuthToken(null);
  localStorage.removeItem('is-authenticated');
};
```

**After:**
```typescript
import { useAuth } from './src/hooks';

const { isAuthenticated, login, logout } = useAuth((path) => {
  // Optional redirect callback
  setActiveTab(path);
});

// Usage
login('/dashboard');
logout();
```

### 5. Update API Service Usage

**Before:**
```typescript
import { api } from './services/api';

// Already using the centralized API - no changes needed!
const users = await api.get<User[]>('/api/users');
```

**After:**
```typescript
import { api } from './src/services';

// Same API, cleaner imports
const users = await api.get<User[]>('/api/users');
```

### 6. Update SignalR Usage

**Before:**
```typescript
import { useSignalR } from './services/signalr';

const { on, off } = useSignalR();
// Already good!
```

**After:**
```typescript
import { useSignalR } from './src/services';

const { on, off, connectionState } = useSignalR();
// Same functionality, cleaner imports
```

## Component Optimization

### Add React.memo for Performance

**Before:**
```typescript
export const UserCard = ({ user }: { user: User }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

**After:**
```typescript
import React from 'react';

export const UserCard = React.memo(({ user }: { user: User }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

### Use useMemo for Computed Values

**Before:**
```typescript
const filteredUsers = users.filter(u => 
  u.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**After:**
```typescript
import { useMemo } from 'react';

const filteredUsers = useMemo(() => 
  users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ),
  [users, searchTerm]
);
```

### Use useCallback for Event Handlers

**Before:**
```typescript
const handleClick = (id: string) => {
  // Handler logic
};
```

**After:**
```typescript
import { useCallback } from 'react';

const handleClick = useCallback((id: string) => {
  // Handler logic
}, [/* dependencies */]);
```

## TypeScript Improvements

### Add Proper Type Definitions

**Before:**
```typescript
const data: any = await api.get('/api/users');
```

**After:**
```typescript
import { User } from './src/types';

const data = await api.get<User[]>('/api/users');
```

### Extract Inline Types

**Before:**
```typescript
const MyComponent = ({ user }: { user: { id: number; name: string } }) => {
  // ...
};
```

**After:**
```typescript
import { User } from './src/types';

interface MyComponentProps {
  user: User;
}

const MyComponent = ({ user }: MyComponentProps) => {
  // ...
};
```

## Environment Configuration

### Create .env File

Create a `.env` file in your project root:

```env
# API Configuration (optional - will auto-detect if not set)
VITE_API_BASE_URL=http://localhost:5235
VITE_API_PORT=5235

# SignalR Configuration (optional - will auto-detect if not set)
VITE_HUB_URL=http://localhost:5000/chathub
VITE_HUB_PORT=5000

# Development
VITE_USE_MOCKS=false

# API Keys
GEMINI_API_KEY=your-api-key-here
```

**Note**: If these are not set, the system will automatically use `window.location.hostname` with default ports.

## Testing Your Migration

### Checklist

- [ ] All imports resolve correctly
- [ ] No console.log statements (except critical errors)
- [ ] App connects to API without hardcoded URLs
- [ ] SignalR connects automatically
- [ ] Theme persists across page refreshes
- [ ] Authentication state persists
- [ ] All TypeScript errors resolved
- [ ] No unused imports

### Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Common Issues

#### Issue: "Module not found" errors

**Solution**: Update import paths to use new structure:
```typescript
// Old
import { api } from './services/api';

// New
import { api } from './src/services';
```

#### Issue: TypeScript errors after migration

**Solution**: Clear TypeScript cache and restart:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Restart VS Code TypeScript server
# Press Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

#### Issue: SignalR not connecting

**Solution**: Check that environment variables are set or ensure your backend is running on the expected port.

## Rollback Plan

If you need to rollback:

1. Old imports still work via re-exports
2. No breaking changes to existing functionality
3. Can gradually migrate components one at a time

## Next Steps

1. Update one component at a time
2. Test thoroughly after each change
3. Remove old console.log statements
4. Add TypeScript types where missing
5. Optimize with React.memo/useMemo where beneficial
6. Consider moving components to feature-based folders

## Need Help?

- Check `ARCHITECTURE.md` for detailed architecture documentation
- Review code comments in new utility files
- Look at TypeScript type definitions for API signatures
