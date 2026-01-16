# Group-Bound RBAC Implementation Guide
**BE-068: Granular Group-Bound Role-Based Access Control**

## Overview
This document describes the implementation of a **hierarchical, department-bound RBAC system** where:
- **Groups** represent organizational units (Departments, Teams)
- **Roles** are job titles bound to specific Groups
- **Users** are assigned to a Group-Role pair
- **Permissions** flow from the Group-Role combination

This enforces strict organizational hierarchy and prevents unauthorized cross-departmental access.

---

## Architecture

### 1. Data Model

#### User Type
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  
  // Legacy (backward compatibility)
  role: 'Admin' | 'Editor' | 'Viewer';
  
  // NEW: Group-Role binding
  groupId?: number;           // Department/Team ID
  roleId?: number;            // Job Title ID
  groupName?: string;         // Display name (UI convenience)
  roleName?: string;          // Display name (UI convenience)
  
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  avatar: string;
}
```

#### Group Type
```typescript
interface Group {
  id: number;
  name: string;              // e.g., "Finance Department"
  description?: string;
  roleIds: number[];         // Roles available in this group
  members: GroupMember[];    // Users with their assigned roles
  permissions?: Permission[];
  createdAt: string;
}

type GroupMember = { 
  userId: number; 
  roleId?: number;           // Required when assigning members
};
```

#### Role Type
```typescript
interface Role {
  id: number;
  name: string;              // e.g., "Finance Manager", "IT Admin"
  description?: string;
  
  // NEW: Group binding
  groupId?: number | null;   // null = SuperAdmin (system-wide)
  groupName?: string;        // Display name
  
  members?: number[];        // User IDs assigned to this role
}
```

---

## Key Features

### 1. Dependent Dropdown Flow (User Assignment)

**Step 1: Select Department/Group**
- Searchable Select dropdown
- Lists all available Groups
- **Required** - cannot proceed without selection

**Step 2: Select Role (Disabled until Group selected)**
- Populated from: `GET /api/v1/admin/groups/{groupId}/roles`
- Shows only roles bound to the selected Group
- **Required** - validates both selections before save

**Implementation:** [components/UserOnboarding.tsx](components/UserOnboarding.tsx)

```tsx
// Example usage:
<UserOnboarding 
  onClose={(created) => { /* refresh user list */ }}
  editingUser={userToEdit}  // Optional: for editing
/>
```

**Validation:**
- ✅ Both Group and Role must be selected
- ✅ Cannot save with incomplete assignment
- ✅ Clear error messages for validation failures

---

### 2. Role Management UI

#### Creating a Role
When creating a new Role, the admin **must** select which Group this role belongs to:

- **Group Selector**: Dropdown with all Groups + "SuperAdmin (No Group)" option
- **SuperAdmin roles**: No group binding - system-wide access (use sparingly)
- **Group-bound roles**: Tied to specific department

**Implementation:** [components/GroupsRoles.tsx](components/GroupsRoles.tsx) - Role Modal

#### Roles List Table
The Roles table now includes a **Group** column:

| Role              | Group               | Description                | Members | Actions   |
|-------------------|---------------------|----------------------------|---------|-----------|
| Finance Manager   | Finance Department  | Manages finance operations | 3       | Edit/Del  |
| IT Manager        | IT Department       | Manages IT infrastructure  | 1       | Edit/Del  |
| SuperAdmin        | SuperAdmin          | System-wide admin          | 0       | Edit/Del  |

**Features:**
- ✅ Filter by Group (dropdown)
- ✅ Search across role name, description, and group name
- ✅ Visual distinction for SuperAdmin roles (amber badge)
- ✅ Visual distinction for group-bound roles (indigo badge)

---

### 3. API Endpoints

#### Get Roles by Group
```typescript
GET /api/v1/admin/groups/{groupId}/roles
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Finance Manager",
      "description": "Manages finance operations",
      "groupId": 1,
      "groupName": "Finance Department",
      "members": [1, 2, 3]
    }
  ]
}
```

**Fallback:** If endpoint unavailable, filters all roles by `groupId` client-side.

---

### 4. JWT Structure & Permissions

The backend JWT should now include:

```json
{
  "sub": "user123",
  "name": "John Doe",
  "email": "john@company.com",
  "groupId": 1,
  "groupName": "Finance Department",
  "roleId": 1,
  "roleName": "Finance Manager",
  "permission": "*.*",  // or array of specific permissions
  "role": "Admin"       // Optional: for backward compatibility
}
```

**AuthContext** automatically extracts:
- `permission` or `permissions` claim (supports both singular/plural)
- `groupId`, `roleId` for organizational context
- Falls back to `role` claim if no permissions present (grants `*` for admin/super roles)

**Wildcard Permissions:**
- `*` or `*.*` = Full access (SuperAdmin)
- `Finance.*` = All finance operations
- `Finance.View` = Specific permission

---

## Usage Examples

### Creating a New User

```tsx
// UserOnboarding component handles the two-step flow:
// Step 1: Name, Email, Status
// Step 2: Group Selection → Role Selection (dependent)

// When submitted, creates user with:
{
  name: "Jane Smith",
  email: "jane@company.com",
  groupId: 1,              // Finance Department
  roleId: 2,               // Accountant
  groupName: "Finance Department",
  roleName: "Accountant",
  status: "Active"
}
```

### Creating a Group-Bound Role

```tsx
// In GroupsRoles component:
// 1. Click "New Role"
// 2. Enter name: "Senior Accountant"
// 3. Enter description: "Handles complex accounting"
// 4. Select Group: "Finance Department"
// 5. Assign members (optional)
// 6. Save

// Creates:
{
  id: 10,
  name: "Senior Accountant",
  description: "Handles complex accounting",
  groupId: 1,
  groupName: "Finance Department",
  members: []
}
```

### Creating a SuperAdmin Role

```tsx
// In GroupsRoles component:
// 1. Click "New Role"
// 2. Enter name: "System Administrator"
// 3. Select Group: "SuperAdmin (No Group - System-wide)"
// 4. Save

// Creates:
{
  id: 100,
  name: "System Administrator",
  description: "Full system access",
  groupId: null,          // No group binding
  members: []
}
```

---

## Migration from Flat RBAC

### Backward Compatibility
The system maintains backward compatibility:

1. **User.role field** still exists (deprecated but functional)
2. **Display logic** prioritizes `groupName` + `roleName` over legacy `role`
3. **Old users** without `groupId`/`roleId` still render with legacy `role` badge

### Migration Steps

1. **Audit existing users**:
   ```sql
   SELECT id, name, email, role FROM users WHERE groupId IS NULL;
   ```

2. **Create Groups** for each department

3. **Create Roles** within each Group

4. **Assign users** to Group-Role pairs via UserOnboarding modal

5. **Update JWT generation** on backend to include:
   - `groupId`, `roleId`
   - `permission` claim (array or `*.*` for admins)

6. **Remove legacy role checks** from frontend after full migration

---

## Security Considerations

### Preventing Cross-Department Access

**Enforced by:**
1. **UI Layer**: Sidebar filters nav items by permissions
2. **Route Layer**: `PermissionGuard` blocks unauthorized routes
3. **Backend**: JWT must include group-scoped permissions

**Example:**
- Finance Manager with `Finance.*` permission cannot access `IT.ServerManagement`
- SuperAdmin with `*.*` can access everything

### SuperAdmin Safeguards

- SuperAdmin roles (`groupId: null`) should be **created sparingly**
- Only for IT admins, System administrators
- Audit trail should track SuperAdmin actions

---

## Testing Checklist

### User Onboarding Flow
- [ ] Step 1 validates name and email
- [ ] Step 2 Group dropdown is searchable
- [ ] Step 2 Role dropdown is disabled until Group selected
- [ ] Step 2 Role dropdown populates from correct endpoint
- [ ] Cannot save without both Group and Role selected
- [ ] Created user appears in UsersList with Group and Role badges

### Role Management
- [ ] "New Role" modal requires Group selection
- [ ] SuperAdmin option available in Group dropdown
- [ ] Roles table displays Group column
- [ ] Filter by Group works correctly
- [ ] Search across name/description/group works
- [ ] Group-bound roles show indigo badge
- [ ] SuperAdmin roles show amber badge

### Permissions & Authorization
- [ ] JWT with `permission: "*.*"` grants full access
- [ ] JWT with `Finance.*` grants Finance permissions only
- [ ] Sidebar shows only authorized menu items
- [ ] Routes blocked by PermissionGuard work correctly
- [ ] Debug panel shows extracted permissions

---

## API Reference

### GroupService

```typescript
// Get all groups
await groupService.getGroups();

// Get roles for a specific group
await groupService.getRolesByGroup(groupId);

// Create group
await groupService.createGroup({
  name: "Marketing Department",
  description: "Marketing and PR team",
  roleIds: [],
  members: []
});

// Create role (group-bound)
await groupService.createRole({
  name: "Marketing Manager",
  description: "Leads marketing campaigns",
  groupId: 3,
  members: []
});

// Create role (SuperAdmin)
await groupService.createRole({
  name: "Super Administrator",
  description: "Full system access",
  groupId: null,  // No group binding
  members: []
});

// Assign members to group
await groupService.assignMembersToGroup(groupId, [
  { userId: 1, roleId: 5 },
  { userId: 2, roleId: 6 }
]);
```

### UserService

```typescript
// Create user with Group-Role assignment
await userService.createUser({
  name: "Alice Johnson",
  email: "alice@company.com",
  groupId: 1,
  roleId: 2,
  groupName: "Finance Department",
  roleName: "Accountant",
  status: "Active"
});

// Update user
await userService.updateUser(userId, {
  groupId: 2,     // Move to IT Department
  roleId: 4,      // Assign as System Administrator
  groupName: "IT Department",
  roleName: "System Administrator"
});
```

---

## Troubleshooting

### Issue: Role dropdown stays disabled
**Cause:** Group not selected or API endpoint failing  
**Fix:** 
1. Verify Group is selected
2. Check browser console for API errors
3. Verify `/api/v1/admin/groups/{groupId}/roles` endpoint
4. Fallback uses client-side filtering if endpoint unavailable

### Issue: Permissions not working
**Cause:** JWT missing `permission` claim  
**Fix:**
1. Open Debug Panel (shield icon)
2. Click "Log claims" to inspect JWT
3. Verify `permission` or `permissions` field exists
4. Update backend JWT generation to include permissions

### Issue: SuperAdmin can't create roles
**Cause:** Permission guard blocking `Role.Create`  
**Fix:**
1. Verify JWT includes `*` or `*.*` permission
2. Check AuthContext extracts wildcard correctly
3. Confirm PermissionControl allows `*.*` pattern

---

## Related Files

**Core Implementation:**
- `src/types/index.ts` - User interface with groupId/roleId
- `services/groupService.ts` - Group, Role types and API
- `services/userService.ts` - User CRUD with Group-Role support
- `components/UserOnboarding.tsx` - Dependent dropdown flow
- `components/GroupsRoles.tsx` - Role management with Group column
- `components/UsersList.tsx` - Display users with Group/Role badges

**Authentication:**
- `src/context/AuthContext.tsx` - JWT parsing and permission extraction

**Documentation:**
- `PERMISSIONS.md` - Permission system overview
- `SECURITY_CHECKLIST.md` - Security audit guide
- `IMPLEMENTATION_SUMMARY.md` - Migration summary

---

## Business Value (BE-068)

**As a:** Project Manager  
**I want to:** Enforce a strict hierarchy where Roles are subsets of Groups and Users are assigned to these specific Roles  
**So that:** The authorization system perfectly mirrors the organizational chart and prevents unauthorized cross-departmental access

**Business Value:**
- ✅ **100% clarity** on "Who does What and Where"
- ✅ **Audit-ready**: Clear group-role assignments
- ✅ **HR-friendly**: Easy onboarding with two-step flow
- ✅ **Security**: Prevents cross-department access by design
- ✅ **Scalable**: Add new departments/roles without code changes

---

## Contact & Support

For questions or issues with Group-bound RBAC implementation:
- Check Debug Panel for JWT structure
- Review console logs for permission extraction
- Verify backend JWT includes `groupId`, `roleId`, `permission` claims
- Test with SuperAdmin role (`groupId: null`) to isolate permission issues

**Last Updated:** January 14, 2026  
**User Story:** BE-068  
**Implementation Status:** ✅ Complete
