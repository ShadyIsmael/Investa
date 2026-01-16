# Frontend Architecture Documentation

## Overview
This document describes the refactored architecture of the Investa Admin Portal frontend application.

## Folder Structure

```
investa-admin-portal/
├── src/
│   ├── components/         # Shared UI components
│   ├── features/          # Feature-specific modules (future)
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTheme.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   ├── services/          # API and backend communication
│   │   ├── api.ts         # Centralized HTTP client
│   │   ├── signalr.tsx    # Real-time SignalR provider
│   │   └── index.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions and helpers
│   │   ├── logger.ts      # Centralized logging
│   │   ├── environment.ts # Environment configuration
│   │   ├── constants.ts   # Application constants
│   │   └── index.ts
│   └── context/           # React Context providers (future)
├── components/            # Legacy component location
├── services/              # Legacy services (re-exports)
├── mocks/                 # Mock data for development
├── public/                # Static assets
├── App.tsx                # Main application component
├── index.tsx              # Application entry point
└── vite.config.ts         # Vite configuration

```

## Key Architectural Improvements

### 1. Dynamic Environment Configuration
**Location**: `src/utils/environment.ts`

All URLs are now dynamically resolved using `window.location.hostname`, eliminating hardcoded IP addresses:

```typescript
// API Base URL
const baseUrl = getDynamicBaseUrl();
// Example: http://your-machine-name:5235

// SignalR Hub URL
const hubUrl = getDynamicHubUrl('/chathub');
// Example: http://your-machine-name:5000/chathub
```

**Configuration Priority**:
1. Environment variables (`.env` file)
2. Cached values (localStorage)
3. Dynamic resolution (window.location.hostname)

### 2. Centralized Logging
**Location**: `src/utils/logger.ts`

Replaces scattered `console.log` statements with a structured logger:

```typescript
import { logger } from 'src/utils/logger';

// Different log levels
logger.debug('Debug information');
logger.info('Informational message');
logger.warn('Warning message');
logger.error('Error occurred', error);

// Specialized domain loggers
logger.api.request('GET', '/api/users');
logger.api.error('GET', '/api/users', error);
logger.signalr.connected(connectionId);
logger.signalr.event('NewMessage', data);
```

**Features**:
- Environment-aware (production suppresses debug/info logs)
- Domain-specific loggers for API and SignalR
- Consistent formatting
- Easy to disable for production builds

### 3. Refactored API Service
**Location**: `src/services/api.ts`

**Key Features**:
- Dynamic URL resolution
- Centralized error handling
- Auth token management
- Global event emission for auth errors
- Support for mock data
- Built-in retry logic for proxy fallback

**Usage**:
```typescript
import { api } from 'src/services/api';

// GET request
const users = await api.get<User[]>('/api/users');

// POST request
const newUser = await api.post<User>('/api/users', userData);

// With mock data (for development)
const users = await api.get<User[]>('/api/users', MOCK_USERS);
```

### 4. Refactored SignalR Service
**Location**: `src/services/signalr.tsx`

**Key Features**:
- Dynamic hub URL resolution
- React Context-based provider
- Automatic reconnection handling
- Event listener management
- Auth lifecycle integration

**Usage**:
```typescript
import { useSignalR } from 'src/services/signalr';

function MyComponent() {
  const { connectionState, on, off } = useSignalR();
  
  useEffect(() => {
    const handler = (data) => {
      // Handle event
    };
    
    on('NewMessage', handler);
    
    return () => off('NewMessage', handler);
  }, [on, off]);
}
```

### 5. Custom Hooks
**Location**: `src/hooks/`

**Available Hooks**:

#### `useAuth`
Manages authentication state and operations:
```typescript
import { useAuth } from 'src/hooks';

function App() {
  const { isAuthenticated, login, logout } = useAuth();
  
  return (
    <button onClick={() => login('/dashboard')}>
      Login
    </button>
  );
}
```

#### `useTheme`
Manages theme state with persistence:
```typescript
import { useTheme } from 'src/hooks';

function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return <button onClick={toggleTheme}>{theme}</button>;
}
```

#### `useLocalStorage`
Type-safe localStorage hook:
```typescript
import { useLocalStorage } from 'src/hooks';

function Settings() {
  const [settings, setSettings] = useLocalStorage('app-settings', {
    notifications: true
  });
}
```

## Migration Guide

### Importing from New Locations

**Old**:
```typescript
import { api } from './services/api';
import { User } from './types';
import { MOCK_USERS } from './constants';
```

**New**:
```typescript
import { api } from './src/services';
import { User } from './src/types';
import { MOCK_USERS } from './src/utils/constants';
```

**Note**: Old imports still work via re-exports for backward compatibility.

### Replacing Console Logs

**Old**:
```typescript
console.log('User logged in:', user);
console.error('API error:', error);
```

**New**:
```typescript
import { logger } from 'src/utils/logger';

logger.info('User logged in', user);
logger.error('API error occurred', error);
```

### Using Custom Hooks

**Old**:
```typescript
const [theme, setTheme] = useState(
  localStorage.getItem('theme') || 'light'
);

useEffect(() => {
  localStorage.setItem('theme', theme);
}, [theme]);
```

**New**:
```typescript
import { useTheme } from 'src/hooks';

const { theme, toggleTheme } = useTheme();
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5235
VITE_API_PORT=5235

# SignalR Configuration
VITE_HUB_URL=http://localhost:5000/chathub
VITE_HUB_PORT=5000

# Development
VITE_USE_MOCKS=false
VITE_HOST=0.0.0.0
VITE_PORT=5173

# API Keys
GEMINI_API_KEY=your-api-key-here
```

**Dynamic Resolution**: If no environment variables are set, the system will automatically use `window.location.hostname` with default ports.

## Performance Optimizations

### React.memo
Use for components that receive stable props:
```typescript
export const UserCard = React.memo(({ user }: { user: User }) => {
  return <div>{user.name}</div>;
});
```

### useMemo
Use for expensive computations:
```typescript
const filteredUsers = useMemo(() => {
  return users.filter(u => u.status === 'Active');
}, [users]);
```

### useCallback
Use for stable function references:
```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

## Code Standards

### Naming Conventions
- **Components**: PascalCase (`UserList`, `Dashboard`)
- **Functions/Variables**: camelCase (`getUserData`, `isAuthenticated`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`User`, `ApiResponse`)
- **Files**: PascalCase for components, camelCase for utilities

### TypeScript
- All data models should have TypeScript interfaces
- Use type inference where possible
- Avoid `any` type, use `unknown` if necessary
- Define function return types explicitly for public APIs

### File Organization
- One component per file
- Group related components in subdirectories
- Keep files under 300 lines when possible
- Extract complex logic into custom hooks

## Testing Checklist

- [ ] All API calls use the centralized `api` service
- [ ] No hardcoded URLs or IP addresses
- [ ] Console.log replaced with logger (except critical errors)
- [ ] No unused imports
- [ ] All components have proper TypeScript types
- [ ] Custom hooks used for reusable logic
- [ ] SignalR connects automatically on auth
- [ ] Theme persists across sessions
- [ ] App works on different machine names/IPs

## Future Improvements

1. **State Management**: Consider Zustand or Redux for global state
2. **Feature Modules**: Organize by feature instead of by file type
3. **Error Boundaries**: Add React error boundaries for better error handling
4. **Code Splitting**: Implement lazy loading for routes
5. **Testing**: Add unit tests with Vitest and React Testing Library
6. **CI/CD**: Set up automated builds and deployments
7. **i18n**: Add internationalization support
8. **Accessibility**: Implement ARIA labels and keyboard navigation

## Support

For questions or issues with the new architecture, please refer to:
- This documentation
- Inline code comments
- TypeScript type definitions
