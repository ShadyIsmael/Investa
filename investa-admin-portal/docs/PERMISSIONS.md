# Permission-Based Access Control System
## Enterprise-Grade Authorization Architecture

### Overview
This document describes the complete refactoring of the authentication and authorization system from role-based to permission-based access control (PBAC). This provides granular, enterprise-level security with JWT-based permission management.

---

## Architecture Components

### 1. AuthContext (`src/context/AuthContext.tsx`)
Central authentication and authorization provider that:
- Parses JWT tokens to extract permissions
- Manages authentication state
- Provides permission checking utilities
- Emits global auth events

**Key Features:**
- Automatic JWT parsing
- Flat permission array storage
- Multiple permission check strategies (any/all)
- Backward compatible with existing auth flows

**Usage:**
```typescript
import { usePermissions, AuthProvider } from './src/context/AuthContext';

// In your app root
function App() {
  return (
    <AuthProvider onRedirect={(path) => navigate(path)}>
      <YourApp />
    </AuthProvider>
  );
}

// In components
function MyComponent() {
  const { 
    isAuthenticated,
    user,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    login,
    logout 
  } = usePermissions();

  // Check single permission
  if (hasPermission('User.Delete')) {
    // User can delete
  }

  // Check any of multiple permissions
  if (hasAnyPermission('User.Edit', 'User.View')) {
    // User has at least one
  }

  // Check all permissions required
  if (hasAllPermissions('Finance.View', 'Finance.Approve')) {
    // User has both
  }
}
```

---

### 2. PermissionControl Component (`src/components/PermissionControl.tsx`)
Declarative component-level access control for UI elements.

**Features:**
- Hides unauthorized elements from DOM (security by default)
- Supports single permission, any-of, or all-of checks
- Optional fallback content
- HOC wrapper available

**Usage:**
```typescript
import { PermissionControl } from './src/components/PermissionControl';

// Single permission
<PermissionControl permission="User.Delete">
  <button onClick={handleDelete}>Delete User</button>
</PermissionControl>

// Any of multiple permissions
<PermissionControl anyOf={['Invoice.View', 'Invoice.Manage']}>
  <InvoiceList />
</PermissionControl>

// All permissions required
<PermissionControl allOf={['Finance.View', 'Finance.Approve']} requireAll>
  <ApprovalButton />
</PermissionControl>

// With fallback content
<PermissionControl 
  permission="Support.View"
  fallback={<div>Contact admin for access</div>}
>
  <SupportDashboard />
</PermissionControl>

// HOC version
const ProtectedComponent = withPermission(MyComponent, 'User.View');
```

---

### 3. PermissionGuard Component (`src/components/PermissionGuard.tsx`)
Route-level protection to prevent unauthorized access via URL manipulation.

**Features:**
- Blocks entire pages/routes
- Prevents URL bypass attempts
- Custom unauthorized screens
- Requires authentication check

**Usage:**
```typescript
import { PermissionGuard } from './src/components/PermissionGuard';

// Protect entire route
function AdminPanel() {
  return (
    <PermissionGuard 
      requiredPermissions={['Admin.Access', 'Settings.Manage']}
      requireAll={true}
    >
      <AdminDashboard />
    </PermissionGuard>
  );
}

// Any permission grants access
function ReportsPage() {
  return (
    <PermissionGuard 
      requiredPermissions={['Report.View', 'Analytics.Access']}
      requireAll={false}
    >
      <Reports />
    </PermissionGuard>
  );
}

// Custom unauthorized screen
function SecurePage() {
  return (
    <PermissionGuard 
      requiredPermissions={['Secure.Access']}
      unauthorizedFallback={<CustomDeniedScreen />}
    >
      <SecureContent />
    </PermissionGuard>
  );
}
```

---

### 4. Permission-Based Navigation
Updated `NavItem` interface and sidebar filtering.

**NavItem Structure:**
```typescript
export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  path: string;
  /** Permissions required to view this item */
  permissions?: string[];
  /** If true, requires ALL permissions; if false, requires ANY */
  requireAll?: boolean;
  children?: NavItem[];
}
```

**Example Navigation Configuration:**
```typescript
const NAV_ITEMS: NavItem[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    iconName: 'grid', 
    path: '/', 
    permissions: ['Dashboard.View'] 
  },
  { 
    id: 'users', 
    label: 'Users', 
    iconName: 'users', 
    path: '/users', 
    permissions: ['User.View', 'User.Manage'],
    children: [
      { 
        id: 'users-management', 
        label: 'Users Management', 
        iconName: 'users', 
        path: '/users', 
        permissions: ['User.Manage'] 
      },
      { 
        id: 'groups', 
        label: 'Groups', 
        iconName: 'users', 
        path: '/users/groups', 
        permissions: ['Group.Manage'] 
      },
    ]
  },
  { 
    id: 'audit', 
    label: 'Audit Trail', 
    iconName: 'shield-check', 
    path: '/audit', 
    permissions: ['Audit.View'],
    requireAll: true
  },
];
```

The Sidebar component automatically filters menu items based on user permissions - items are completely hidden from the DOM if the user lacks the required permissions.

---

## Permission Naming Convention

Follow this enterprise-standard naming pattern:

```
{Resource}.{Action}
```

**Examples:**
- `User.View` - View user list
- `User.Edit` - Edit user details
- `User.Delete` - Delete users
- `User.Create` - Create new users
- `User.Manage` - Full user management (implies Create, Edit, Delete)

- `Finance.View` - View financial data
- `Finance.Approve` - Approve financial transactions
- `Account.Audit` - Access audit logs
- `Report.Export` - Export reports
- `Settings.Manage` - Manage system settings
- `Support.Chat` - Access support chat
- `Invoice.Create` - Create invoices
- `Payment.Process` - Process payments

---

## JWT Token Format

The system expects JWT tokens with a `permissions` claim:

```json
{
  "sub": "user-123",
  "email": "admin@investa.com",
  "name": "Admin User",
  "permissions": [
    "Dashboard.View",
    "User.View",
    "User.Edit",
    "User.Delete",
    "Finance.View",
    "Finance.Manage",
    "Report.View",
    "Audit.View"
  ],
  "iat": 1642000000,
  "exp": 1642086400
}
```

**Supported Claim Names:**
- `permissions` (preferred)
- `Permissions` (PascalCase)
- `permission`
- `scope`
- `scopes`

**Supported Formats:**
- Array: `["User.View", "User.Edit"]`
- Space-separated string: `"User.View User.Edit"`

---

## Login Flow

### Updated Login Process:
```typescript
// In Login component
const { login } = usePermissions();

async function performLogin() {
  const response = await api.post('/api/v1/Auth/login-email', { email, password });
  const token = response.token;
  
  // AuthContext automatically parses JWT and extracts permissions
  login(token, 'dashboard');
}
```

### What Happens:
1. User submits credentials
2. Backend returns JWT with permissions
3. `login()` function parses JWT
4. Permissions extracted and stored
5. User authenticated and redirected
6. All permission checks now active

---

## Migration from Role-Based System

### Before (Role-Based):
```typescript
// Old approach - DEPRECATED
if (user.role === 'Admin') {
  // Show admin features
}

// Old navigation
{ 
  id: 'audit', 
  label: 'Audit', 
  roles: ['Admin']  // ❌ Don't use
}
```

### After (Permission-Based):
```typescript
// New approach - RECOMMENDED
const { hasPermission } = usePermissions();

if (hasPermission('Audit.View')) {
  // Show audit features
}

// New navigation
{ 
  id: 'audit', 
  label: 'Audit', 
  permissions: ['Audit.View']  // ✅ Use permissions
}
```

---

## Security Best Practices

### 1. Always Hide, Never Disable
```typescript
// ❌ BAD - Disabled button still in DOM
<button disabled={!hasPermission('User.Delete')}>Delete</button>

// ✅ GOOD - Completely removed from DOM
<PermissionControl permission="User.Delete">
  <button>Delete</button>
</PermissionControl>
```

### 2. Backend Validation Required
Frontend permission checks are for UX only. **Always validate permissions on the backend** for true security.

### 3. Use Specific Permissions
```typescript
// ❌ BAD - Too broad
<PermissionControl permission="Admin">

// ✅ GOOD - Specific action
<PermissionControl permission="User.Delete">
```

### 4. Combine Guards for Routes
```typescript
// Protected route with fallback
<PermissionGuard requiredPermissions={['Finance.View']}>
  <PermissionControl permission="Finance.Approve">
    <ApproveButton />
  </PermissionControl>
</PermissionGuard>
```

### 5. Test Permission Boundaries
```typescript
// Test different permission combinations
const permissions = ['User.View', 'Report.Export'];

hasPermission('User.View')           // true
hasPermission('User.Delete')         // false
hasAnyPermission('User.Edit', 'User.View')  // true
hasAllPermissions('User.View', 'Report.Export')  // true
hasAllPermissions('User.View', 'User.Delete')    // false
```

---

## Common Patterns

### Pattern 1: Conditional Rendering
```typescript
function UserList() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <table>...</table>
      
      {hasPermission('User.Create') && (
        <button onClick={openCreateModal}>Add User</button>
      )}
    </div>
  );
}
```

### Pattern 2: Multiple Action Buttons
```typescript
<PermissionControl permission="User.Edit">
  <button onClick={handleEdit}>Edit</button>
</PermissionControl>

<PermissionControl permission="User.Delete">
  <button onClick={handleDelete}>Delete</button>
</PermissionControl>

<PermissionControl permission="User.Deactivate">
  <button onClick={handleDeactivate}>Deactivate</button>
</PermissionControl>
```

### Pattern 3: Nested Permissions
```typescript
<PermissionControl anyOf={['Finance.View', 'Finance.Manage']}>
  <FinanceDashboard>
    <PermissionControl permission="Finance.Approve">
      <ApprovalSection />
    </PermissionControl>
    
    <PermissionControl permission="Finance.Export">
      <ExportButton />
    </PermissionControl>
  </FinanceDashboard>
</PermissionControl>
```

### Pattern 4: Permission-Based Routing
```typescript
function AppRouter() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      
      <Route path="/admin" element={
        <PermissionGuard requiredPermissions={['Admin.Access']}>
          <AdminPanel />
        </PermissionGuard>
      } />
      
      <Route path="/finance" element={
        <PermissionGuard requiredPermissions={['Finance.View']}>
          <FinanceModule />
        </PermissionGuard>
      } />
    </Routes>
  );
}
```

---

## Testing Permissions

### Development Mock Token
For testing, you can create a mock JWT with specific permissions:

```typescript
// Mock token generator (for development only)
const mockPermissions = [
  'Dashboard.View',
  'User.View',
  'User.Edit',
  'Finance.View',
];

const mockToken = createMockJWT({
  sub: 'dev-user-1',
  email: 'dev@test.com',
  name: 'Dev User',
  permissions: mockPermissions,
});

login(mockToken);
```

### Test Different Permission Levels
```typescript
// Viewer permissions
const viewerPermissions = ['Dashboard.View', 'Report.View'];

// Editor permissions
const editorPermissions = [...viewerPermissions, 'User.Edit', 'Finance.Edit'];

// Admin permissions
const adminPermissions = [...editorPermissions, 'User.Delete', 'Settings.Manage', 'Audit.View'];
```

---

## Troubleshooting

### Issue: User sees "Access Denied" but should have access
1. Check JWT token contains correct permissions claim
2. Verify permission string matches exactly (case-sensitive)
3. Check if `requireAll` is true when should be false
4. Ensure token hasn't expired

### Issue: Buttons still visible without permission
1. Verify `PermissionControl` is imported correctly
2. Check component is wrapped, not just referenced
3. Ensure `hideWhenDenied` prop is not set to false

### Issue: Sidebar items not filtering
1. Check `permissions` array is set on NavItem
2. Verify AuthProvider wraps the entire app
3. Check usePermissions hook is being called in Sidebar

---

## Performance Considerations

1. **Permission checks are fast** - O(1) lookups on flat array
2. **Memoization** - Permission hooks use `useCallback` for stability
3. **DOM optimization** - Unauthorized elements never render
4. **Token parsing** - Happens once on login, cached in state

---

## Future Enhancements

1. **Permission Groups** - Alias multiple permissions
2. **Dynamic Permissions** - Load permissions from backend API
3. **Permission Expiry** - Time-limited permissions
4. **Audit Logging** - Track permission checks
5. **Permission Delegation** - Temporary permission grants

---

## Support & Contact

For questions or issues with the permission system:
- Review this documentation
- Check JWT token structure
- Verify backend permission claims
- Test with mock tokens first

---

**Last Updated:** January 14, 2026
**Version:** 2.0.0
**Architecture:** Enterprise Permission-Based Access Control

---

## Group-Bound RBAC (BE-068)

**IMPORTANT UPDATE:** The system now supports **Group-bound RBAC** where:
- **Groups** = Departments/Teams (e.g., Finance, IT, Support)
- **Roles** = Job titles bound to Groups (e.g., Finance Manager, IT Admin)
- **Users** = Assigned to a Group-Role pair
- **Permissions** = Derived from Group-Role combination

### Key Changes

1. **User Assignment Flow**
   - **Step 1**: Select Department/Group (searchable dropdown)
   - **Step 2**: Select Role (dependent dropdown - disabled until Group selected)
   - **Validation**: Both selections required before save

2. **Role Management**
   - Roles must be assigned to a Group (or marked as SuperAdmin)
   - Roles table includes "Group" column
   - Filter/search roles by Group

3. **JWT Structure**
   `json
   {
     "sub": "user123",
     "name": "John Doe",
     "email": "john@company.com",
     "groupId": 1,
     "groupName": "Finance Department",
     "roleId": 2,
     "roleName": "Finance Manager",
     "permission": "*.*",
     "role": "Admin"
   }
   `

4. **Permissions by Group**
   - Finance Department → Finance.* permissions
   - IT Department → IT.*, System.* permissions
   - SuperAdmin (no group) → *.* full access

**See [GROUP_RBAC_GUIDE.md](GROUP_RBAC_GUIDE.md) for complete implementation details.**

---

**User Story:** BE-068  
**Implementation Date:** January 14, 2026

