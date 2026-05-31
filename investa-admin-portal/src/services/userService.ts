
import { api } from '@/api/api';
import { MOCK_USERS, MOST_REPORTED_USERS } from '@/mocks';
import { User, ReportedUser, PaginatedUsers } from '@/types';

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string; // GUID
  groupId?: number;
  status?: 'active' | 'inactive';
}

export const userService = {
  /**
   * Fetch users with pagination according to backend contract.
   * Endpoint: GET /api/admin/users/list
   */
  async getUsers(params: GetUsersParams = {}): Promise<PaginatedUsers> {
    const {
      page = 1,
      pageSize = 25,
      search,
      roleId,
      groupId,
      status,
    } = params;

    // Build query string with optional filters
    const queryParams = new URLSearchParams();
    queryParams.set('page', String(page));
    queryParams.set('pageSize', String(pageSize));
    if (search) queryParams.set('search', search);
    if (roleId) queryParams.set('roleId', roleId);
    if (groupId) queryParams.set('groupId', String(groupId));
    if (status) queryParams.set('status', status);

    try {
      const res = await api.get<PaginatedUsers>(`/api/v1/admin/users/list?${queryParams.toString()}`);
      return res ?? { items: [], total: 0, page, pageSize };
    } catch (err) {
      console.warn('Backend users API unavailable, using mock data', err);
      // Fallback: filter mock data
      let filteredUsers = [...MOCK_USERS];
      
      if (search) {
        const q = search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        );
      }
      
      if (status) {
        const statusFilter = status === 'active' ? 'Active' : 'Inactive';
        filteredUsers = filteredUsers.filter(u => u.status === statusFilter);
      }

      const total = filteredUsers.length;
      const start = (page - 1) * pageSize;
      const items = filteredUsers.slice(start, start + pageSize);

      return { items, total, page, pageSize };
    }
  },
  
  async getReportedUsers(): Promise<ReportedUser[]> {
    try {
      const res = await api.get<any>('/api/moderation/reported');
      return res?.data ?? res ?? [];
    } catch (err) {
      return MOST_REPORTED_USERS;
    }
  },

  /**
   * Create a new user.
   * Endpoint: POST /api/admin/users
   */
  async createUser(payload: Partial<User>) {
    try {
      const res = await api.post<User>('/api/v1/admin/users', payload);
      return res ?? null;
    } catch (err) {
      console.warn('Backend create user API unavailable, using mock', err);
      // Fallback to mock
      const nextId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const added: User = {
        id: nextId,
        firstName: payload.firstName || null,
        lastName: payload.lastName || null,
        name: payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'New User',
        email: payload.email || null,
        role: payload.role || null,
        roleId: payload.roleId || null,
        groupId: payload.groupId || null,
        groupName: payload.groupName || null,
        roleName: payload.roleName || null,
        status: payload.status || 'Active',
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        avatar: payload.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'U')}&background=random`,
        metadata: payload.metadata || {}
      };
      MOCK_USERS.push(added);
      return added;
    }
  },

  /**
   * Update an existing user.
   * Endpoint: PUT /api/admin/users/{id}
   */
  async updateUser(userId: string, payload: Partial<User>) {
    try {
      const res = await api.put<User>(`/api/v1/admin/users/${userId}`, payload);
      return res ?? null;
    } catch (err) {
      console.warn('Backend update user API unavailable, using mock', err);
      // Fallback to mock
      const idx = MOCK_USERS.findIndex(u => u.id === userId);
      if (idx !== -1) {
        MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...payload, updatedAt: new Date().toISOString() };
        return MOCK_USERS[idx];
      }
      throw new Error('User not found');
    }
  },

  /**
   * Register a new user via admin panel.
   * Endpoint: POST /api/v1/admin/register
   */
  /**
   * Register a new user via admin panel.
   * Endpoint: POST /api/v1/admin/register
   */
  async registerUser(payload: { email: string; password: string; firstName: string; lastName?: string; phoneNumber?: string; role?: string }) {
    try {
      const body = {
        Email: payload.email,
        Password: payload.password,
        FirstName: payload.firstName,
        LastName: payload.lastName || '',
        PhoneNumber: payload.phoneNumber || '',
        Role: payload.role || 'User'
      };
      const res = await api.post<any>('/api/v1/admin/register', body);
      const data = res?.data ?? res;
      
      if (data && (data.success === false || data.success === 'false')) {
        const errMsg = data.message || 'Registration failed';
        const details = (data.errors && Array.isArray(data.errors)) ? data.errors.join(', ') : '';
        throw new Error(details ? `${errMsg}: ${details}` : errMsg);
      }
      return data.data ?? data;
    } catch (err: any) {
      console.warn('Backend register user API unavailable, using mock', err);
      const nextId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const added: User = {
        id: nextId,
        firstName: payload.firstName,
        lastName: payload.lastName || null,
        name: `${payload.firstName} ${payload.lastName || ''}`.trim() || payload.email,
        email: payload.email,
        role: payload.role || null,
        roleId: null,
        groupId: null,
        groupName: null,
        roleName: null,
        status: 'Active',
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        avatar: `https://picsum.photos/seed/${encodeURIComponent(payload.email)}/100/100`,
        metadata: {}
      };
      MOCK_USERS.push(added);
      return added;
    }
  },

  /**
   * Delete a user.
   * Endpoint: DELETE /api/admin/users/{id}
   */
  async deleteUser(userId: string) {
    try {
      const res = await api.delete<any>(`/api/v1/admin/users/${userId}`);
      return res?.data ?? res ?? null;
    } catch (err) {
      console.warn('Backend delete user API unavailable, using mock', err);
      const idx = MOCK_USERS.findIndex(u => u.id === userId);
      if (idx !== -1) {
        const removed = MOCK_USERS.splice(idx, 1)[0];
        return removed;
      }
      throw new Error('User not found');
    }
  },

  /**
   * Fetch available roles.
   * Endpoint: GET /api/v1/admin/roles
   */
  async getRoles() {
    try {
      const res = await api.get<any>('/api/v1/admin/roles');
      const data = res?.data ?? res ?? [];
      const arr = Array.isArray(data) ? data : (data.items || []);
      return arr.map((r: any) => (typeof r === 'string' ? r : r.name ?? String(r)));
    } catch (err) {
      console.warn('Backend roles API unavailable, using static list', err);
      return ['Admin', 'Editor', 'Viewer'];
    }
  },

  /**
   * Fetch available user statuses.
   * Endpoint: GET /api/v1/admin/user-statuses (custom endpoint, if available)
   */
  async getStatuses() {
    try {
      const res = await api.get<any>('/api/v1/admin/user-statuses');
      const data = res?.data ?? res ?? [];
      return Array.isArray(data) ? data : (data.items || []);
    } catch (err) {
      return ['Active', 'Inactive'];
    }
  },

  /**
   * Bulk delete users.
   * Endpoint: POST /api/admin/users/bulk-delete (if available)
   * Falls back to individual deletes.
   */
  async bulkDelete(userIds: string[]) {
    try {
      const res = await api.post<any>('/api/v1/admin/users/bulk-delete', { ids: userIds });
      return res?.data ?? res ?? null;
    } catch (err) {
      console.warn('Backend bulk delete API unavailable, using individual deletes', err);
      const results: any[] = [];
      for (const id of userIds) {
        try {
          results.push(await this.deleteUser(id));
        } catch (e) {
          results.push({ error: e });
        }
      }
      return results;
    }
  },

  /**
   * Bulk update user status.
   * Endpoint: POST /api/admin/users/bulk-update-status (if available)
   */
  async bulkUpdateStatus(userIds: string[], status: 'Active' | 'Inactive') {
    try {
      const res = await api.post<any>('/api/v1/admin/users/bulk-update-status', { ids: userIds, status });
      return res?.data ?? res ?? null;
    } catch (err) {
      console.warn('Backend bulk update status API unavailable, using individual updates', err);
      const results: any[] = [];
      for (const id of userIds) {
        try {
          results.push(await this.updateUser(id, { status }));
        } catch (e) {
          results.push({ error: e });
        }
      }
      return results;
    }
  }
};
