# Permission System - Quick Start Guide
**For Developers** | 5-Minute Setup Guide

---

## 🚀 Getting Started

### Step 1: Wrap Your App (Already Done!)
The app is already wrapped with `AuthProvider` in `App.tsx`.

### Step 2: Use Permissions in Components

```typescript
import { usePermissions } from './src/context/AuthContext';

function MyComponent() {
  const { hasPermission, hasAnyPermission } = usePermissions();
  
  // Check single permission
  const canDelete = hasPermission('User.Delete');
  
  // Check multiple permissions (any)
  const canManage = hasAnyPermission('User.Edit', 'User.Delete');
  
  return (
    <div>
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

### Step 3: Protect UI Elements

```typescript
import { PermissionControl } from './src/components/PermissionControl';

// Single permission
<PermissionControl permission="User.Delete">
  <button onClick={handleDelete}>Delete</button>
</PermissionControl>

// Any of multiple permissions
<PermissionControl anyOf={['User.Edit', 'User.Delete']}>
  <ActionMenu />
</PermissionControl>

// All permissions required
<PermissionControl allOf={['Finance.View', 'Finance.Approve']} requireAll>
  <ApprovalButton />
</PermissionControl>
```

### Step 4: Protect Routes

```typescript
import { PermissionGuard } from './src/components/PermissionGuard';

function AdminPage() {
  return (
    <PermissionGuard requiredPermissions={['Admin.Access']}>
      <AdminContent />
    </PermissionGuard>
  );
}
```

---

## 📋 Common Permissions

Copy and use these standard permissions:

### User Management
```typescript
'User.View'       // View users
'User.Edit'       // Edit users
'User.Delete'     // Delete users
'User.Create'     // Create users
'User.Manage'     // Full access
```

### Finance
```typescript
'Finance.View'    // View financial data
'Finance.Manage'  // Manage finances
'Invoice.Create'  // Create invoices
'Invoice.Approve' // Approve invoices
```

### System
```typescript
'Settings.Manage' // System settings
'Audit.View'      // View audit logs
'System.Debug'    // Debug tools
```

---

## 🎨 UI Patterns

### Pattern 1: Conditional Button
```typescript
<PermissionControl permission="User.Delete">
  <button 
    onClick={() => deleteUser(id)}
    className="btn-danger"
  >
    Delete User
  </button>
</PermissionControl>
```

### Pattern 2: Action Menu
```typescript
<div className="action-menu">
  <PermissionControl permission="User.Edit">
    <MenuItem onClick={handleEdit}>Edit</MenuItem>
  </PermissionControl>
  
  <PermissionControl permission="User.Delete">
    <MenuItem onClick={handleDelete}>Delete</MenuItem>
  </PermissionControl>
</div>
```

### Pattern 3: Feature Section
```typescript
<PermissionControl 
  permission="Analytics.View"
  fallback={<UpgradePrompt />}
>
  <AnalyticsDashboard />
</PermissionControl>
```

---

## 🔐 Route Protection

### Protect a Single Route
```typescript
case 'admin':
  return (
    <PermissionGuard requiredPermissions={['Admin.Access']}>
      <AdminPanel />
    </PermissionGuard>
  );
```

### Protect with Multiple Permissions (Any)
```typescript
<PermissionGuard 
  requiredPermissions={['Support.View', 'Chat.View']}
  requireAll={false}  // Any permission grants access
>
  <SupportDashboard />
</PermissionGuard>
```

### Protect with All Required
```typescript
<PermissionGuard 
  requiredPermissions={['Finance.View', 'Finance.Approve']}
  requireAll={true}   // Must have BOTH
>
  <ApprovalPanel />
</PermissionGuard>
```

---

## 🧪 Testing Locally

### Create Test Tokens
```typescript
// Development helper
const testPermissions = {
  viewer: ['Dashboard.View', 'Report.View'],
  editor: ['Dashboard.View', 'User.View', 'User.Edit'],
  admin: ['Dashboard.View', 'User.Manage', 'Settings.Manage']
};

// Use in development login
login(createMockJWT(testPermissions.editor));
```

### Test Permission Checks
```typescript
// In browser console
const { hasPermission } = usePermissions();

hasPermission('User.Delete');  // Check if user can delete
```

---

## ⚡ Cheat Sheet

```typescript
// Import
import { usePermissions } from './src/context/AuthContext';
import { PermissionControl } from './src/components/PermissionControl';
import { PermissionGuard } from './src/components/PermissionGuard';

// Hook
const { 
  hasPermission,        // Check single
  hasAnyPermission,     // Check any
  hasAllPermissions,    // Check all
  permissions,          // Array of all permissions
  user                  // Current user
} = usePermissions();

// Component
<PermissionControl permission="Resource.Action">
  <YourComponent />
</PermissionControl>

// Route Guard
<PermissionGuard requiredPermissions={['Resource.Action']}>
  <ProtectedPage />
</PermissionGuard>
```

---

## 🚨 Common Mistakes

### ❌ Don't: Disable buttons
```typescript
// BAD - Button still in DOM
<button disabled={!hasPermission('User.Delete')}>
  Delete
</button>
```

### ✅ Do: Hide completely
```typescript
// GOOD - Not in DOM at all
<PermissionControl permission="User.Delete">
  <button>Delete</button>
</PermissionControl>
```

### ❌ Don't: Check roles
```typescript
// BAD - Don't use roles
if (user.role === 'Admin') { }
```

### ✅ Do: Check permissions
```typescript
// GOOD - Use specific permissions
if (hasPermission('Settings.Manage')) { }
```

---

## 📞 Need Help?

1. **Documentation:** See [PERMISSIONS.md](./PERMISSIONS.md)
2. **Security:** See [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)
3. **Examples:** Look at existing components (UsersList, GroupsRoles)

---

## ✅ Checklist for New Features

When adding a new feature:

- [ ] Define permission(s) needed (e.g., `MyFeature.View`)
- [ ] Add permission to JWT token (backend)
- [ ] Wrap route with `PermissionGuard`
- [ ] Wrap action buttons with `PermissionControl`
- [ ] Add to navigation with `permissions` array
- [ ] Test with and without permission
- [ ] Document new permission

---

**Remember:** 
- Frontend permissions are for UX only
- Always validate on backend
- Be specific with permissions
- Hide, don't disable

**Happy coding! 🚀**
