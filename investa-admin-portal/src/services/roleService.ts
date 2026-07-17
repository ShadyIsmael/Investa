import { api } from '@/api/api';
import { AssignPermissionsDto, AssignUsersDto, Group, PaginatedUsers, Permission, Role, RoleCreateDto, RoleUpdateDto, RoleWithGroup, User } from '@/types';

export interface RoleUser {
  id: string;
  name: string;
  email: string | null;
}

const asArray = <T>(value: T[] | { data?: T[] } | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.data) ? value.data : [];
};

export const roleService = {
  async getAllRoles(): Promise<RoleWithGroup[]> {
    return asArray(await api.get<RoleWithGroup[]>('/api/v1/admin/roles'));
  },

  async getGroups(): Promise<Group[]> {
    const response = await api.get<{ items: Group[] }>('/api/v1/admin/groups/list?page=1&pageSize=100');
    return Array.isArray(response?.items) ? response.items : [];
  },

  async getRolesByGroup(groupId: number): Promise<Role[]> {
    return asArray(await api.get<Role[]>(`/api/v1/admin/groups/${groupId}/roles`));
  },

  async getRoleById(roleId: string): Promise<RoleWithGroup> {
    return await api.get<RoleWithGroup>(`/api/v1/admin/roles/${roleId}`);
  },

  async createRole(payload: RoleCreateDto): Promise<Role> {
    return await api.post<Role>('/api/v1/admin/roles', payload);
  },

  async updateRole(roleId: string, payload: RoleUpdateDto): Promise<Role> {
    return await api.put<Role>(`/api/v1/admin/roles/${roleId}`, payload);
  },

  async deleteRole(roleId: string): Promise<void> {
    await api.delete(`/api/v1/admin/roles/${roleId}`);
  },

  async getAllPermissions(): Promise<Permission[]> {
    const permissions = asArray(await api.get<Permission[]>('/api/v1/admin/permissions'));
    return permissions.filter(permission => Number.isInteger(Number(permission.id)) && Number(permission.id) > 0);
  },

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return asArray(await api.get<Permission[]>(`/api/v1/admin/roles/${roleId}/permissions`));
  },

  async assignPermissions(roleId: string, payload: AssignPermissionsDto): Promise<void> {
    await api.post(`/api/v1/admin/roles/${roleId}/permissions`, payload);
  },

  async getRoleUsers(roleId: string): Promise<RoleUser[]> {
    return asArray(await api.get<RoleUser[]>(`/api/v1/admin/roles/${roleId}/users`));
  },

  async assignUsers(roleId: string, payload: AssignUsersDto): Promise<void> {
    await api.post(`/api/v1/admin/roles/${roleId}/users`, payload);
  },

  async removeUserFromRole(roleId: string, userId: string): Promise<void> {
    await api.delete(`/api/v1/admin/roles/${roleId}/users/${userId}`);
  },

  async getOrgUsers(): Promise<User[]> {
    const users: User[] = [];
    let page = 1;
    const pageSize = 100;

    while (true) {
      const response = await api.get<PaginatedUsers>(`/api/v1/admin/users/list?page=${page}&pageSize=${pageSize}`);
      const items = Array.isArray(response?.items) ? response.items : [];
      users.push(...items);
      if (users.length >= Number(response?.total ?? 0) || items.length < pageSize) break;
      page += 1;
    }

    return users;
  },
};
