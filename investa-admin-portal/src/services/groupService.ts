import { api } from '@/api/api';
import { Group, PaginatedGroups, GroupCreateDto, GroupUpdateDto, MemberSample } from '@/types';

const GROUPS_KEY = 'investa:mock:groups';

// Mock data seeding
const seedMockGroups = () => {
  if (!localStorage.getItem(GROUPS_KEY)) {
    const mockGroups: Group[] = [
      {
        id: 1,
        name: 'Finance',
        slug: 'finance',
        description: 'Accounts & billing team',
        parentGroupId: null,
        memberCount: 14,
        membersSample: [
          { id: 'user-guid-2', name: 'Bob Smith', email: 'bob@nexus.com', role: 'Finance Editor' },
          { id: 'user-guid-4', name: 'Diana Evans', email: 'diana@nexus.com', role: 'Finance Manager' },
        ],
        permissions: ['Finance.View', 'Invoice.Manage', 'Budget.View'],
        status: 'Active',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { location: 'US', departmentCode: 'FIN' }
      },
      {
        id: 2,
        name: 'Engineering',
        slug: 'engineering',
        description: 'Software development team',
        parentGroupId: null,
        memberCount: 8,
        membersSample: [
          { id: 'user-guid-1', name: 'Alice Johnson', email: 'alice@nexus.com', role: 'System Admin' },
        ],
        permissions: ['System.Manage', 'Code.Review', 'Deploy.Execute'],
        status: 'Active',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { location: 'Global', departmentCode: 'ENG' }
      },
      {
        id: 3,
        name: 'Support',
        slug: 'support',
        description: 'Customer service and support team',
        parentGroupId: null,
        memberCount: 5,
        membersSample: [
          { id: 'user-guid-3', name: 'Charlie Davis', email: 'charlie@nexus.com', role: 'Support Viewer' },
        ],
        permissions: ['Support.View', 'Tickets.Manage'],
        status: 'Active',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { location: 'US', departmentCode: 'SUP' }
      },
      {
        id: 4,
        name: 'Marketing',
        slug: 'marketing',
        description: 'Marketing and brand management',
        parentGroupId: null,
        memberCount: 3,
        membersSample: [
          { id: 'user-guid-5', name: 'Ethan Hunt', email: 'ethan@nexus.com', role: 'Marketing Viewer' },
        ],
        permissions: ['Marketing.View', 'Campaign.Create'],
        status: 'Active',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { location: 'US', departmentCode: 'MKT' }
      },
    ];
    localStorage.setItem(GROUPS_KEY, JSON.stringify(mockGroups));
  }
};

seedMockGroups();

const readMockGroups = (): Group[] => {
  try {
    const data = localStorage.getItem(GROUPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const writeMockGroups = (groups: Group[]) => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
};

export const groupService = {
  /**
   * Get groups list with pagination.
   * Endpoint: GET /api/admin/groups/list
   */
  async getGroupsList(page = 1, pageSize = 10, search = ''): Promise<PaginatedGroups> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (search) params.set('search', search);

    try {
      // New backend endpoint expected by server
      const res = await api.get<any>(`/api/v1/admin/groups/list?${params.toString()}`);
      // Normalize different backend shapes to our PaginatedGroups
      const data = res ?? {};
      const items = Array.isArray(data.items) ? data.items : (data.items || []);
      const total = data.totalCount ?? data.total ?? 0;
      const pg = data.page ?? page;
      const ps = data.pageSize ?? pageSize;
      return { items, total, page: pg, pageSize: ps } as PaginatedGroups;
    } catch (err) {
      console.warn('Backend groups API unavailable, using mock data', err);
      // Fallback to mock
      let allGroups = readMockGroups();
      
      if (search) {
        const q = search.toLowerCase();
        allGroups = allGroups.filter(
          g => g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)
        );
      }

      const total = allGroups.length;
      const start = (page - 1) * pageSize;
      const items = allGroups.slice(start, start + pageSize);

      return { items, total, page, pageSize };
    }
  },

  /**
   * Get single group by ID.
   * Endpoint: GET /api/admin/groups/{id}
   */
  async getGroupById(groupId: number): Promise<Group | null> {
    try {
      const res = await api.get<Group>(`/api/admin/groups/${groupId}`);
      return res ?? null;
    } catch (err) {
      console.warn('Backend get group API unavailable, using mock', err);
      const groups = readMockGroups();
      return groups.find(g => g.id === groupId) || null;
    }
  },

  /**
   * Create a new group.
   * Endpoint: POST /api/admin/groups
   */
  async createGroup(payload: GroupCreateDto): Promise<{ id: number } | null> {
    try {
      const res = await api.post<{ id: number }>('/api/v1/admin/groups', payload);
      return res ?? null;
    } catch (err) {
      console.warn('Backend create group API unavailable, using mock', err);
      const groups = readMockGroups();
      const nextId = groups.length > 0 ? Math.max(...groups.map(g => g.id)) + 1 : 1;
      
      const newGroup: Group = {
        id: nextId,
        name: payload.name,
        slug: payload.name.toLowerCase().replace(/\s+/g, '-'),
        description: payload.description || null,
        parentGroupId: payload.parentGroupId || null,
        memberCount: 0,
        membersSample: [],
        permissions: [],
        status: payload.isActive !== false ? 'Active' : 'Inactive',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        metadata: payload.metadata || {}
      };
      
      groups.push(newGroup);
      writeMockGroups(groups);
      
      return { id: nextId };
    }
  },

  /**
   * Update an existing group.
   * Endpoint: PUT /api/admin/groups/{id}
   */
  async updateGroup(groupId: number, payload: GroupUpdateDto): Promise<void> {
    try {
      await api.put(`/api/admin/groups/${groupId}`, payload);
    } catch (err) {
      console.warn('Backend update group API unavailable, using mock', err);
      const groups = readMockGroups();
      const idx = groups.findIndex(g => g.id === groupId);
      
      if (idx !== -1) {
        groups[idx] = {
          ...groups[idx],
          name: payload.name,
          description: payload.description || null,
          parentGroupId: payload.parentGroupId || null,
          status: payload.isActive !== false ? 'Active' : 'Inactive',
          metadata: payload.metadata || groups[idx].metadata,
          updatedAt: new Date().toISOString()
        };
        writeMockGroups(groups);
      } else {
        throw new Error('Group not found');
      }
    }
  },

  /**
   * Delete a group.
   * Endpoint: DELETE /api/admin/groups/{id}
   */
  async deleteGroup(groupId: number): Promise<void> {
    try {
      await api.delete(`/api/admin/groups/${groupId}`);
    } catch (err) {
      console.warn('Backend delete group API unavailable, using mock', err);
      const groups = readMockGroups();
      const filtered = groups.filter(g => g.id !== groupId);
      
      if (filtered.length === groups.length) {
        throw new Error('Group not found');
      }
      
      writeMockGroups(filtered);
    }
  },

  /**
   * Get all available permissions.
   * Endpoint: GET /api/v1/admin/permissions (or /api/admin/permissions)
   */
  async getAllPermissions(): Promise<string[]> {
    try {
      // Try v1 endpoint first
      const res = await api.get<any>('/api/v1/admin/permissions');
      const data = res?.data ?? res;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data.map(p => typeof p === 'string' ? p : p.key);
      }
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((p: any) => typeof p === 'string' ? p : p.key);
      }
      
      return [];
    } catch (err) {
      console.warn('Backend permissions API unavailable, using static list', err);
      // Static fallback permissions (Resource.Action format)
      return [
        'User.View', 'User.Create', 'User.Edit', 'User.Delete', 'User.Manage',
        'Group.View', 'Group.Create', 'Group.Edit', 'Group.Delete', 'Group.Manage',
        'Role.View', 'Role.Create', 'Role.Edit', 'Role.Delete', 'Role.Manage',
        'Finance.View', 'Finance.Approve', 'Finance.Manage',
        'Invoice.View', 'Invoice.Create', 'Invoice.Edit', 'Invoice.Delete', 'Invoice.Manage',
        'Budget.View', 'Budget.Edit', 'Budget.Approve',
        'System.View', 'System.Manage',
        'Support.View', 'Support.Manage',
        'Marketing.View', 'Marketing.Create', 'Marketing.Manage',
        'Code.Review', 'Deploy.Execute',
        'Tickets.View', 'Tickets.Manage',
        'Campaign.View', 'Campaign.Create', 'Campaign.Manage',
      ];
    }
  },

  /**
   * Update group permissions.
   * Endpoint: POST /api/v1/admin/groups/{id}/permissions (or PUT)
   */
  async updateGroupPermissions(groupId: number, permissions: string[]): Promise<void> {
    try {
      // Try v1 endpoint first
      await api.post(`/api/v1/admin/groups/${groupId}/permissions`, { permissions });
    } catch (err1) {
      try {
        // Try alternate endpoint
        await api.put(`/api/admin/groups/${groupId}/permissions`, { permissions });
      } catch (err2) {
        console.warn('Backend update group permissions API unavailable, using mock', err2);
        const groups = readMockGroups();
        const idx = groups.findIndex(g => g.id === groupId);
        
        if (idx !== -1) {
          groups[idx].permissions = permissions;
          groups[idx].updatedAt = new Date().toISOString();
          writeMockGroups(groups);
        } else {
          throw new Error('Group not found');
        }
      }
    }
  }
};
