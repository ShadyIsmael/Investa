import { api } from '@/api/api';
import { Role, RoleWithGroup, RoleCreateDto, AssignPermissionsDto, AssignUsersDto, Permission } from '@/types';

const ROLES_KEY = 'investa:mock:roles';

// Mock data seeding
const seedMockRoles = () => {
  if (!localStorage.getItem(ROLES_KEY)) {
    const mockRoles: RoleWithGroup[] = [
      {
        id: 'role-guid-admin-1',
        name: 'System Admin',
        description: 'Full system access',
        groupId: 1,
        groupName: 'Administration',
        isActive: true,
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'role-guid-editor-1',
        name: 'Finance Editor',
        description: 'Edit finance data',
        groupId: 2,
        groupName: 'Finance',
        isActive: true,
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'role-guid-editor-2',
        name: 'Finance Manager',
        description: 'Manage finance operations',
        groupId: 2,
        groupName: 'Finance',
        isActive: true,
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'role-guid-viewer-1',
        name: 'Support Viewer',
        description: 'Read-only support access',
        groupId: 3,
        groupName: 'Support',
        isActive: true,
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'role-guid-viewer-2',
        name: 'Marketing Viewer',
        description: 'View marketing data',
        groupId: 4,
        groupName: 'Marketing',
        isActive: true,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      },
    ];
    localStorage.setItem(ROLES_KEY, JSON.stringify(mockRoles));
  }
};

seedMockRoles();

const readMockRoles = (): RoleWithGroup[] => {
  try {
    const data = localStorage.getItem(ROLES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const writeMockRoles = (roles: RoleWithGroup[]) => {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
};

export const roleService = {
  /**
   * Get all roles in the system.
   * Endpoint: GET /api/v1/admin/roles
   */
  async getAllRoles(): Promise<RoleWithGroup[]> {
    try {
      const res = await api.get<RoleWithGroup[]>('/api/v1/admin/roles');
      return res ?? [];
    } catch (err) {
      console.warn('Backend get all roles API unavailable, using mock', err);
      return readMockRoles();
    }
  },

  /**
   * Get roles by group ID.
   * Endpoint: GET /api/v1/admin/groups/{groupId}/roles
   */
  async getRolesByGroup(groupId: number): Promise<Role[]> {
    try {
      const res = await api.get<Role[]>(`/api/v1/admin/groups/${groupId}/roles`);
      return res ?? [];
    } catch (err) {
      console.warn('Backend get roles by group API unavailable, using mock', err);
      const allRoles = readMockRoles();
      return allRoles.filter(r => r.groupId === groupId);
    }
  },

  /**
   * Get single role by ID.
   * Endpoint: GET /api/v1/admin/roles/{roleId}
   */
  async getRoleById(roleId: string): Promise<RoleWithGroup | null> {
    try {
      const res = await api.get<RoleWithGroup>(`/api/v1/admin/roles/${roleId}`);
      return res ?? null;
    } catch (err) {
      console.warn('Backend get role by ID API unavailable, using mock', err);
      const roles = readMockRoles();
      return roles.find(r => r.id === roleId) || null;
    }
  },

  /**
   * Create a new role.
   * Endpoint: POST /api/v1/admin/roles
   */
  async createRole(payload: RoleCreateDto): Promise<RoleWithGroup | null> {
    try {
      const res = await api.post<RoleWithGroup>('/api/v1/admin/roles', payload);
      return res ?? null;
    } catch (err) {
      console.warn('Backend create role API unavailable, using mock', err);
      const roles = readMockRoles();
      
      const newRole: RoleWithGroup = {
        id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: payload.name,
        description: payload.description || null,
        groupId: payload.groupId,
        groupName: `Group ${payload.groupId}`, // In real scenario, fetch from groups
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      roles.push(newRole);
      writeMockRoles(roles);
      
      return newRole;
    }
  },

  /**
   * Assign permissions to a role (replaces existing permissions).
   * Endpoint: POST /api/v1/admin/roles/{roleId}/permissions
   */
  async assignPermissions(roleId: string, payload: AssignPermissionsDto): Promise<void> {
    try {
      await api.post(`/api/v1/admin/roles/${roleId}/permissions`, payload);
    } catch (err) {
      console.warn('Backend assign permissions API unavailable, mock acknowledged', err);
      // Mock: just acknowledge (no-op in mock since we don't track role permissions in mock)
    }
  },

  /**
   * Assign users to a role.
   * Endpoint: POST /api/v1/admin/roles/{roleId}/users
   */
  async assignUsers(roleId: string, payload: AssignUsersDto): Promise<void> {
    try {
      await api.post(`/api/v1/admin/roles/${roleId}/users`, payload);
    } catch (err) {
      console.warn('Backend assign users to role API unavailable, mock acknowledged', err);
      // Mock: just acknowledge (no-op in mock)
    }
  },

  /**
   * Remove a user from a role.
   * Endpoint: DELETE /api/v1/admin/roles/{roleId}/users/{userId}
   */
  async removeUserFromRole(roleId: string, userId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/admin/roles/${roleId}/users/${userId}`);
    } catch (err) {
      console.warn('Backend remove user from role API unavailable, mock acknowledged', err);
      // Mock: just acknowledge (no-op in mock)
    }
  },

  /**
   * Update a role.
   * Endpoint: PUT /api/v1/admin/roles/{roleId}
   */
  async updateRole(roleId: string, payload: Partial<RoleCreateDto>): Promise<void> {
    try {
      await api.put(`/api/v1/admin/roles/${roleId}`, payload);
    } catch (err) {
      console.warn('Backend update role API unavailable, using mock', err);
      const roles = readMockRoles();
      const idx = roles.findIndex(r => r.id === roleId);
      
      if (idx !== -1) {
        roles[idx] = {
          ...roles[idx],
          name: payload.name || roles[idx].name,
          description: payload.description !== undefined ? payload.description : roles[idx].description,
          groupId: payload.groupId || roles[idx].groupId,
        };
        writeMockRoles(roles);
      } else {
        throw new Error('Role not found');
      }
    }
  },

  /**
   * Delete a role.
   * Endpoint: DELETE /api/v1/admin/roles/{roleId}
   */
  async deleteRole(roleId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/admin/roles/${roleId}`);
    } catch (err) {
      console.warn('Backend delete role API unavailable, using mock', err);
      const roles = readMockRoles();
      const filtered = roles.filter(r => r.id !== roleId);
      
      if (filtered.length === roles.length) {
        throw new Error('Role not found');
      }
      
      writeMockRoles(filtered);
    }
  },

  /**
   * Get permissions assigned to a role.
   * Endpoint: GET /api/v1/admin/roles/{roleId}/permissions
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    try {
      const res = await api.get<Permission[]>(`/api/v1/admin/roles/${roleId}/permissions`);
      return res ?? [];
    } catch (err) {
      console.warn('Backend get role permissions API unavailable, using mock', err);
      // Mock: return empty array (not tracked in mock)
      return [];
    }
  },

  /**
   * Get users assigned to a role.
   * Endpoint: GET /api/v1/admin/roles/{roleId}/users
   */
  async getRoleUsers(roleId: string): Promise<any[]> {
    try {
      const res = await api.get<any[]>(`/api/v1/admin/roles/${roleId}/users`);
      return res ?? [];
    } catch (err) {
      console.warn('Backend get role users API unavailable, using mock', err);
      // Mock: return empty array (not tracked in mock)
      return [];
    }
  }
};
