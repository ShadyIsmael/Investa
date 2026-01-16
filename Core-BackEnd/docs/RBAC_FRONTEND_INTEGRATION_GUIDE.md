# RBAC System - Frontend Integration Guide
**Target Audience:** Senior Frontend Web Developer  
**Last Updated:** January 15, 2026  
**Backend Version:** v1.0  

---

## Table of Contents
1. [RBAC Architecture Overview](#rbac-architecture-overview)
2. [Authentication & Authorization Flow](#authentication--authorization-flow)
3. [API Endpoints - Complete Reference](#api-endpoints---complete-reference)
4. [Data Models & TypeScript Interfaces](#data-models--typescript-interfaces)
5. [Integration Examples](#integration-examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## RBAC Architecture Overview

### Core Concepts

The Investa platform implements a **Group-Bound Role** architecture with the following hierarchy:

```
Groups (Top Level - Departments/Teams)
  └── Roles (Owned by Groups - e.g., "Finance Manager", "Finance Viewer")
       ├── Users (Assigned to Roles)
       └── Permissions (Assigned to Roles)
```

#### Key Principles

1. **Groups** represent organizational units (Finance, HR, Engineering, etc.)
   - Groups can have their own permissions (applied to all members)
   - Groups contain metadata (location, departmentCode, etc.)

2. **Roles** MUST belong to a Group
   - Each role has a unique name within its group
   - Roles define a set of permissions
   - Users are assigned to roles (not directly to groups)

3. **Permissions** are granular access controls
   - Format: `Resource.Action` (e.g., `clients.view`, `invoices.create`)
   - Wildcard support: `clients.*`, `*.*`
   - Permissions can be assigned to:
     - **Roles** (RolePermission table)
     - **Groups** (GroupPermission table - inherited by all roles in that group)

4. **Users** gain permissions through their assigned roles
   - A user can have multiple roles
   - Effective permissions = Union of (Role permissions + Group permissions of all assigned roles)

### Permission Resolution Flow

```
User requests protected resource
  ↓
1. Check JWT token for permission claims (fast path)
  ↓
2. If not in token → Query database:
   - Get user's roles (UserRole table)
   - Get permissions from those roles (RolePermission)
   - Get permissions from roles' groups (GroupPermission)
   - Union all permissions
  ↓
3. Check if required permission matches:
   - Exact match (e.g., `clients.view`)
   - Wildcard match (e.g., `clients.*` grants `clients.view`)
   - Admin wildcard (`*.*` or `admin.*`)
  ↓
4. Authorize or Deny
```

---

## Authentication & Authorization Flow

### 1. User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 3600,
  "user": {
    "id": "4e8e64ce-00c0-4cd9-9c2e-2631c6168166",
    "email": "user@example.com",
    "role": "OrgUser"
  }
}
```

### 2. Include Token in Requests
All API requests to protected endpoints require:
```http
Authorization: Bearer <token>
```

### 3. Permission Claims (in JWT)
The backend may include permission claims in the JWT token:
```json
{
  "sub": "4e8e64ce-00c0-4cd9-9c2e-2631c6168166",
  "permission": ["clients.view", "clients.create", "invoices.*"],
  "role": "Admin"
}
```

**Note:** If permissions are not in the token, the backend will query them from the database on-demand.

---

## API Endpoints - Complete Reference

### Base URL
```
http://localhost:5000/api
```

All admin endpoints require **Admin role** unless otherwise noted.

---

## 📋 Users Management API

### 1. Get Users List (Paginated)
Retrieve all users with role and group information.

**Endpoint:**
```http
GET /api/admin/users/list
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `pageSize` | integer | No | 25 | Items per page |
| `search` | string | No | - | Search by name or email |
| `roleId` | guid | No | - | Filter by specific role ID |
| `groupId` | integer | No | - | Filter by group ID |
| `status` | string | No | - | Filter by status: "active" or "inactive" |

**Request Example:**
```http
GET /api/admin/users/list?page=1&pageSize=25&status=active&search=jane
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "4e8e64ce-00c0-4cd9-9c2e-2631c6168166",
      "firstName": "Jane",
      "lastName": "Doe",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "Account Editor",
      "roleId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "groupName": "Finance",
      "groupId": 7,
      "roleName": "Account Editor",
      "status": "Active",
      "lastLogin": "2026-01-14T18:23:00Z",
      "createdAt": "2024-05-02T12:00:00Z",
      "updatedAt": "2025-12-01T09:30:00Z",
      "avatar": "https://example.com/avatars/jane.jpg",
      "metadata": {
        "department": "Finance",
        "location": "US"
      }
    }
  ],
  "total": 342,
  "page": 1,
  "pageSize": 25
}
```

---

## 🏢 Groups Management API

### 1. Get Groups List (Paginated)
Retrieve all groups with member counts, permissions, and metadata.

**Endpoint:**
```http
GET /api/admin/groups/list
```

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `pageSize` | integer | No | 10 | Items per page |
| `search` | string | No | - | Search by name or description |

**Request Example:**
```http
GET /api/admin/groups/list?page=1&pageSize=10&search=finance
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": 21,
      "name": "Finance",
      "slug": "finance",
      "description": "Accounts & billing team",
      "parentGroupId": null,
      "memberCount": 14,
      "membersSample": [
        {
          "id": "4e8e64ce-00c0-4cd9-9c2e-2631c6168166",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "role": "Editor"
        },
        {
          "id": "5f9e75df-11d1-5dea-ad3f-3742d7279277",
          "name": "John Smith",
          "email": "john@example.com",
          "role": "Viewer"
        }
      ],
      "permissions": [
        "Finance.View",
        "Invoice.Manage",
        "Budget.View"
      ],
      "status": "Active",
      "createdAt": "2024-04-01T12:00:00Z",
      "updatedAt": "2025-12-05T09:00:00Z",
      "metadata": {
        "location": "US",
        "departmentCode": "FIN"
      }
    }
  ],
  "total": 32,
  "page": 1,
  "pageSize": 10
}
```

### 2. Get Single Group
**Endpoint:**
```http
GET /api/admin/groups/{id}
```

**Response (200 OK):** Same structure as single item in list above.

**Response (404 Not Found):**
```json
{
  "message": "Group not found"
}
```

### 3. Create Group
**Endpoint:**
```http
POST /api/admin/groups
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Engineering",
  "description": "Software development team",
  "parentGroupId": null,
  "isActive": true,
  "metadata": {
    "location": "Global",
    "departmentCode": "ENG"
  }
}
```

**Response (201 Created):**
```json
{
  "id": 23
}
```

### 4. Update Group
**Endpoint:**
```http
PUT /api/admin/groups/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Engineering",
  "description": "Software development and DevOps team",
  "parentGroupId": null,
  "isActive": true,
  "metadata": {
    "location": "Global",
    "departmentCode": "ENG",
    "budget": "500000"
  }
}
```

**Response (204 No Content)**

### 5. Delete Group
**Endpoint:**
```http
DELETE /api/admin/groups/{id}
```

**Response (204 No Content)**

**Note:** Deleting a group may fail if:
- Group has active roles
- Group has members
- Database constraints prevent deletion

---

## 👥 Roles Management API

### 1. Get All Roles
Retrieve all roles in the system with their group information.

**Endpoint:**
```http
GET /api/v1/admin/roles
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Finance Manager",
    "description": "Full access to finance module",
    "groupId": 21,
    "groupName": "Finance",
    "isActive": true,
    "createdAt": "2024-04-01T12:00:00Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Finance Viewer",
    "description": "Read-only access to finance data",
    "groupId": 21,
    "groupName": "Finance",
    "isActive": true,
    "createdAt": "2024-04-01T12:30:00Z"
  }
]
```

### 2. Get Roles by Group
**Endpoint:**
```http
GET /api/v1/admin/groups/{groupId}/roles
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Finance Manager",
    "description": "Full access to finance module",
    "groupId": 21,
    "isActive": true,
    "createdAt": "2024-04-01T12:00:00Z"
  }
]
```

### 3. Get Single Role
**Endpoint:**
```http
GET /api/v1/admin/roles/{roleId}
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Finance Manager",
  "description": "Full access to finance module",
  "groupId": 21,
  "groupName": "Finance",
  "isActive": true,
  "createdAt": "2024-04-01T12:00:00Z"
}
```

### 4. Create Role
**Endpoint:**
```http
POST /api/v1/admin/roles
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "name": "HR Manager",
  "description": "Manage HR operations",
  "groupId": 15
}
```

**Validation Rules:**
- `name` is required
- `groupId` is required (must exist and be active)
- Role name must be unique within the group

**Response (201 Created):**
```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "name": "HR Manager",
  "description": "Manage HR operations",
  "groupId": 15,
  "isActive": true,
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Role 'HR Manager' already exists in this group"
}
```

### 5. Assign Permissions to Role
Replaces all existing permissions with the new set.

**Endpoint:**
```http
POST /api/v1/admin/roles/{roleId}/permissions
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "permissionIds": [1, 5, 12, 23, 45]
}
```

**Response (200 OK):**
```json
{
  "message": "Permissions assigned successfully"
}
```

### 6. Assign Users to Role
Add one or more users to a role (existing assignments are preserved).

**Endpoint:**
```http
POST /api/v1/admin/roles/{roleId}/users
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "userIds": [
    "4e8e64ce-00c0-4cd9-9c2e-2631c6168166",
    "5f9e75df-11d1-5dea-ad3f-3742d7279277"
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "Users assigned to role"
}
```

**Note:** Duplicate assignments are ignored (idempotent operation).

### 7. Remove User from Role
**Endpoint:**
```http
DELETE /api/v1/admin/roles/{roleId}/users/{userId}
Authorization: Bearer <ADMIN_TOKEN>
```

**Response (204 No Content)**

**Response (404 Not Found):**
```json
{
  "message": "User role assignment not found"
}
```

---

## Data Models & TypeScript Interfaces

### User Interface
```typescript
interface User {
  id: string; // GUID
  firstName: string | null;
  lastName: string | null;
  name: string; // Full name (computed)
  email: string | null;
  role: string | null; // Legacy role field
  roleId: string | null; // GUID
  groupName: string | null;
  groupId: number | null;
  roleName: string | null;
  status: 'Active' | 'Inactive';
  lastLogin: string | null; // ISO 8601 datetime
  createdAt: string; // ISO 8601 datetime
  updatedAt: string | null; // ISO 8601 datetime
  avatar: string | null; // URL
  metadata: {
    department?: string;
    location?: string;
    [key: string]: any;
  };
}

interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}
```

### Group Interface
```typescript
interface MemberSample {
  id: string; // GUID
  name: string | null;
  email: string | null;
  role: string | null;
}

interface Group {
  id: number;
  name: string;
  slug: string | null;
  description: string | null;
  parentGroupId: number | null;
  memberCount: number;
  membersSample: MemberSample[];
  permissions: string[]; // Array of permission keys
  status: 'Active' | 'Inactive';
  createdAt: string; // ISO 8601 datetime
  updatedAt: string | null; // ISO 8601 datetime
  metadata: {
    location?: string;
    departmentCode?: string;
    [key: string]: any;
  };
}

interface PaginatedGroups {
  items: Group[];
  total: number;
  page: number;
  pageSize: number;
}

interface GroupCreateDto {
  name: string;
  description?: string;
  parentGroupId?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

interface GroupUpdateDto {
  name: string;
  description?: string;
  parentGroupId?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}
```

### Role Interface
```typescript
interface Role {
  id: string; // GUID
  name: string;
  description: string | null;
  groupId: number;
  isActive: boolean;
  createdAt: string; // ISO 8601 datetime
}

interface RoleWithGroup extends Role {
  groupName: string;
}

interface RoleCreateDto {
  name: string;
  description?: string;
  groupId: number;
}

interface AssignPermissionsDto {
  permissionIds: number[];
}

interface AssignUsersDto {
  userIds: string[]; // Array of GUIDs
}
```

---

## Integration Examples

### Example 1: Fetch and Display Users with Filtering
```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
  groupId?: number;
  status?: 'active' | 'inactive';
}

async function fetchUsers(
  token: string,
  params: FetchUsersParams = {}
): Promise<PaginatedUsers> {
  const response = await axios.get<PaginatedUsers>(
    `${API_BASE}/admin/users/list`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 25,
        search: params.search,
        roleId: params.roleId,
        groupId: params.groupId,
        status: params.status,
      },
    }
  );
  return response.data;
}

// Usage
const users = await fetchUsers(adminToken, {
  page: 1,
  pageSize: 50,
  status: 'active',
  groupId: 21,
});

console.log(`Total users: ${users.total}`);
users.items.forEach((user) => {
  console.log(`${user.name} - ${user.roleName} (${user.groupName})`);
});
```

### Example 2: Create Group and Assign Roles
```typescript
async function createGroupWithRole(token: string) {
  // 1. Create group
  const groupResponse = await axios.post(
    `${API_BASE}/admin/groups`,
    {
      name: 'Marketing',
      description: 'Marketing and brand management',
      isActive: true,
      metadata: {
        location: 'US',
        departmentCode: 'MKT',
        budget: '250000',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const groupId = groupResponse.data.id;
  console.log(`Group created with ID: ${groupId}`);

  // 2. Create role in the group
  const roleResponse = await axios.post(
    `${API_BASE}/v1/admin/roles`,
    {
      name: 'Marketing Manager',
      description: 'Manage marketing campaigns',
      groupId: groupId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const roleId = roleResponse.data.id;
  console.log(`Role created with ID: ${roleId}`);

  // 3. Assign permissions to role
  await axios.post(
    `${API_BASE}/v1/admin/roles/${roleId}/permissions`,
    {
      permissionIds: [10, 11, 12, 15, 20], // Example permission IDs
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('Permissions assigned to role');

  return { groupId, roleId };
}
```

### Example 3: Assign Users to a Role
```typescript
async function assignUsersToRole(
  token: string,
  roleId: string,
  userIds: string[]
) {
  await axios.post(
    `${API_BASE}/v1/admin/roles/${roleId}/users`,
    {
      userIds: userIds,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log(`Assigned ${userIds.length} users to role ${roleId}`);
}

// Usage
await assignUsersToRole(adminToken, roleId, [
  '4e8e64ce-00c0-4cd9-9c2e-2631c6168166',
  '5f9e75df-11d1-5dea-ad3f-3742d7279277',
]);
```

### Example 4: Remove User from Role
```typescript
async function removeUserFromRole(
  token: string,
  roleId: string,
  userId: string
) {
  try {
    await axios.delete(
      `${API_BASE}/v1/admin/roles/${roleId}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(`User ${userId} removed from role ${roleId}`);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log('User role assignment not found');
    } else {
      throw error;
    }
  }
}
```

### Example 5: React Component - User Management Table
```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from './auth-context';

const UserManagementTable: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    groupId: null as number | null,
  });

  useEffect(() => {
    loadUsers();
  }, [page, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(token, {
        page,
        pageSize,
        search: filters.search || undefined,
        status: filters.status as any,
        groupId: filters.groupId || undefined,
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
    setPage(1); // Reset to first page
  };

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search}
          onChange={handleSearchChange}
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Group</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.avatar && (
                      <img src={user.avatar} alt="" width="32" />
                    )}
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.roleName || '-'}</td>
                  <td>{user.groupName || '-'}</td>
                  <td>
                    <span
                      className={`badge ${
                        user.status === 'Active' ? 'success' : 'inactive'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'Never'}
                  </td>
                  <td>
                    <button onClick={() => editUser(user.id)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <button
              disabled={page * pageSize >= total}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## Error Handling

### Common HTTP Status Codes

| Status Code | Meaning | Common Causes |
|-------------|---------|---------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Update/delete succeeded |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Backend error |

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Role name is required",
    "GroupId must be greater than 0"
  ]
}
```

### Handling Errors in Frontend
```typescript
async function safeApiCall<T>(
  apiCall: () => Promise<T>
): Promise<T | null> {
  try {
    return await apiCall();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        // Redirect to login
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        // Show permission denied message
        alert('You do not have permission to perform this action');
      } else if (error.response?.data) {
        // Show error message from backend
        const errorData = error.response.data;
        alert(errorData.message || 'An error occurred');
      }
    } else {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    }
    return null;
  }
}

// Usage
const users = await safeApiCall(() =>
  fetchUsers(token, { page: 1, pageSize: 25 })
);
if (users) {
  // Process users
}
```

---

## Best Practices

### 1. Token Management
```typescript
// Store token securely (use httpOnly cookies in production)
const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
  delete axios.defaults.headers.common['Authorization'];
};

// Initialize axios with token on app load
const token = localStorage.getItem('auth_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
```

### 2. Permission Checking (Client-Side)
```typescript
interface DecodedToken {
  permission?: string[];
  role?: string;
  exp: number;
}

function hasPermission(
  token: string,
  requiredPermission: string
): boolean {
  try {
    // Decode JWT (use a library like jwt-decode)
    const decoded: DecodedToken = jwtDecode(token);

    if (!decoded.permission) return false;

    const permissions = new Set(decoded.permission);

    // Check exact match
    if (permissions.has(requiredPermission)) return true;

    // Check wildcard
    const [resource, action] = requiredPermission.split('.');
    if (permissions.has(`${resource}.*`)) return true;

    // Check admin wildcard
    if (permissions.has('*.*') || permissions.has('admin.*')) return true;

    return false;
  } catch {
    return false;
  }
}

// Usage in React component
const ProtectedButton: React.FC<{ permission: string }> = ({
  permission,
  children,
}) => {
  const { token } = useAuth();

  if (!hasPermission(token, permission)) {
    return null; // Hide button
  }

  return <button>{children}</button>;
};
```

### 3. Caching Strategy
```typescript
// Simple in-memory cache for frequently accessed data
class ApiCache {
  private cache = new Map<string, { data: any; expiry: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  clear() {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

async function fetchGroupsWithCache(
  token: string,
  params: any
): Promise<PaginatedGroups> {
  const cacheKey = `groups_${JSON.stringify(params)}`;
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${API_BASE}/admin/groups/list`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  apiCache.set(cacheKey, response.data);
  return response.data;
}
```

### 4. Optimistic Updates
```typescript
async function assignUserToRoleOptimistic(
  roleId: string,
  userId: string,
  onSuccess: () => void,
  onError: (error: any) => void
) {
  // Optimistically update UI
  onSuccess();

  try {
    await axios.post(
      `${API_BASE}/v1/admin/roles/${roleId}/users`,
      { userIds: [userId] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (error) {
    // Revert UI on error
    onError(error);
  }
}
```

### 5. Debounced Search
```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (searchTerm: string) => {
  const users = await fetchUsers(token, { search: searchTerm });
  setUsers(users.items);
}, 300);

// In component
<input
  type="text"
  onChange={(e) => debouncedSearch(e.target.value)}
  placeholder="Search users..."
/>
```

---

## Testing Checklist

### Before Integration
- [ ] Verify backend API is running on correct port (5000)
- [ ] Obtain admin token via login endpoint
- [ ] Test all endpoints with Postman/Insomnia
- [ ] Verify CORS is configured for your frontend domain

### Integration Testing
- [ ] Can fetch users list with pagination
- [ ] Can filter users by status, role, group
- [ ] Can search users by name/email
- [ ] Can create, update, delete groups
- [ ] Can create roles and assign to groups
- [ ] Can assign users to roles
- [ ] Can remove users from roles
- [ ] Can assign permissions to roles
- [ ] Error handling works for 401, 403, 404, 500

### UI/UX Testing
- [ ] Loading states display correctly
- [ ] Pagination controls work properly
- [ ] Search is debounced and responsive
- [ ] Permission-based UI elements hide/show correctly
- [ ] Error messages are user-friendly
- [ ] Success feedback is provided for mutations

---

## Support & Questions

### Backend Team Contact
- **Lead Engineer:** [Your Name]
- **Email:** dev@investa.local
- **Documentation:** `/docs` folder in backend repo

### Common Issues & Solutions

**Issue:** 401 Unauthorized
- **Solution:** Token expired or invalid. Re-login to get new token.

**Issue:** 403 Forbidden
- **Solution:** User lacks Admin role. Verify role in JWT token.

**Issue:** CORS errors
- **Solution:** Backend CORS policy allows localhost by default. For production, contact backend team to whitelist your domain.

**Issue:** Pagination not working
- **Solution:** Ensure `page` and `pageSize` are positive integers.

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-15 | 1.0 | Initial RBAC implementation with Group-Bound Roles |

---

## Appendix: Database Schema Reference

### Key Tables
1. **Groups** - Organizational units
2. **Roles** - Job functions (must belong to a group)
3. **UserRoles** - User ↔ Role assignments
4. **RolePermissions** - Role ↔ Permission assignments
5. **GroupPermissions** - Group ↔ Permission assignments (inherited by all roles in group)
6. **Permissions** - Granular access controls

### Relationships
```
User (1) ───< (N) UserRole (N) ───> (1) Role (N) ───> (1) Group
                                       │
                                       └───< (N) RolePermission (N) ───> (1) Permission
Group (1) ───< (N) GroupPermission (N) ───> (1) Permission
```

---

**End of Integration Guide**
