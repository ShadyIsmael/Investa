import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { roleService } from '@/services/roleService';
import { groupService } from '@/services/groupService';
import { userService } from '@/services/userService';
import { RoleWithGroup, Group, Permission, User } from '@/types';
import PermissionControl from '@/components/common/PermissionControl';

export const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleWithGroup[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<number | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingRole, setEditingRole] = useState<RoleWithGroup | null>(null);
  
  // Details modal state
  const [detailsRole, setDetailsRole] = useState<RoleWithGroup | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [roleUsers, setRoleUsers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupId: '' as number | '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadRoles();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, groupFilter]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const allRoles = await roleService.getAllRoles();
      let filtered = allRoles;
      
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          r => r.name.toLowerCase().includes(q) || 
               r.description?.toLowerCase().includes(q) ||
               r.groupName?.toLowerCase().includes(q)
        );
      }
      
      if (groupFilter) {
        filtered = filtered.filter(r => r.groupId === Number(groupFilter));
      }
      
      setRoles(filtered);
    } catch (error) {
      console.error('Failed to load roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await groupService.getGroupsList(1, 100);
      setGroups(data.items);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadAllPermissions = async () => {
    try {
      const perms = await groupService.getAllPermissions();
      setAllPermissions(perms);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const data = await userService.getUsers({ page: 1, pageSize: 1000 });
      setAvailableUsers(data.items);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  useEffect(() => {
    loadRoles();
    loadGroups();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', description: '', groupId: '' });
    setShowModal(true);
  };

  const openEditModal = (role: RoleWithGroup) => {
    setModalMode('edit');
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      groupId: role.groupId ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const name = (formData.name || '').trim();
    if (!name) {
      setFormError('Role name is required');
      return;
    }

    if (formData.groupId === '') {
      setFormError('Group is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Pre-submit uniqueness check within the selected group
      const groupIdNum = Number(formData.groupId);
      const existingRoles = await roleService.getRolesByGroup(groupIdNum);
      const duplicate = existingRoles.some(r => r.name?.toLowerCase() === name.toLowerCase() && (modalMode === 'create' || r.id !== editingRole?.id));
      if (duplicate) {
        setFormError('A role with this name already exists in the selected group');
        setIsSubmitting(false);
        return;
      }

      if (modalMode === 'create') {
        // Optimistic UI: insert a temporary role immediately
        const tempId = `temp-${Date.now()}`;
        const groupObj = groups.find(g => g.id === groupIdNum);
        const tempRole: RoleWithGroup = {
          id: tempId,
          name,
          description: formData.description || null,
          groupId: groupIdNum,
          groupName: groupObj?.name || `Group ${groupIdNum}`,
          isActive: true,
          createdAt: new Date().toISOString(),
        } as RoleWithGroup;

        setRoles(prev => [tempRole, ...prev]);

        try {
          await roleService.createRole({ name, description: formData.description, groupId: groupIdNum });
          toast.success('Role created successfully');
          setShowModal(false);
          await loadRoles();
        } catch (err: any) {
          // remove temp role on failure
          setRoles(prev => prev.filter(r => r.id !== tempId));
          const msg = err?.message || 'Failed to create role';
          setFormError(msg);
          toast.error(msg);
        }

      } else if (editingRole) {
        // Optimistic update: snapshot and update UI
        const prevRoles = [...roles];
        setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name, description: formData.description || null } : r));

        try {
          await roleService.updateRole(editingRole.id, { name, description: formData.description, groupId: groupIdNum });
          toast.success('Role updated successfully');
          setShowModal(false);
          await loadRoles();
        } catch (err: any) {
          // revert on error
          setRoles(prevRoles);
          const msg = err?.message || 'Failed to update role';
          setFormError(msg);
          toast.error(msg);
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Unexpected error';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      await roleService.deleteRole(roleId);
      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error: any) {
      console.error('Failed to delete role:', error);
      toast.error(error.message || 'Failed to delete role');
    }
  };

  const openDetailsModal = async (role: RoleWithGroup) => {
    setDetailsRole(role);
    setShowDetailsModal(true);
    
    try {
      // Load permissions, users, available users
      await loadAllPermissions();
      await loadAvailableUsers();
      
      const perms = await roleService.getRolePermissions(role.id);
      setRolePermissions(perms);
      setSelectedPermissionIds(perms.map(p => p.id));
      
      const users = await roleService.getRoleUsers(role.id);
      setRoleUsers(users);
    } catch (error) {
      console.error('Failed to load role details:', error);
    }
  };

  const handleSavePermissions = async () => {
    if (!detailsRole) return;
    
    try {
      await roleService.assignPermissions(detailsRole.id, {
        permissionIds: selectedPermissionIds,
      });
      toast.success('Permissions updated successfully');
      
      // Reload permissions
      const perms = await roleService.getRolePermissions(detailsRole.id);
      setRolePermissions(perms);
    } catch (error: any) {
      console.error('Failed to update permissions:', error);
      toast.error(error.message || 'Failed to update permissions');
    }
  };

  const handleAssignUsers = async () => {
    if (!detailsRole || selectedUserIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
    
    try {
      await roleService.assignUsers(detailsRole.id, {
        userIds: selectedUserIds,
      });
      toast.success(`Assigned ${selectedUserIds.length} user(s) to role`);
      
      // Reload users
      const users = await roleService.getRoleUsers(detailsRole.id);
      setRoleUsers(users);
      setSelectedUserIds([]);
    } catch (error: any) {
      console.error('Failed to assign users:', error);
      toast.error(error.message || 'Failed to assign users');
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!detailsRole) return;
    
    if (!confirm(`Remove "${userName}" from this role?`)) {
      return;
    }
    
    try {
      await roleService.removeUserFromRole(detailsRole.id, userId);
      toast.success('User removed from role');
      
      // Reload users
      const users = await roleService.getRoleUsers(detailsRole.id);
      setRoleUsers(users);
    } catch (error: any) {
      console.error('Failed to remove user:', error);
      toast.error(error.message || 'Failed to remove user');
    }
  };

  const togglePermission = (permId: number) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Roles Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage roles and their permissions within groups
          </p>
        </div>
        <PermissionControl permissions={['Role.Create']}>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Create Role
          </button>
        </PermissionControl>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Groups</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No roles found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {role.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {role.groupName || `Group ${role.groupId}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {role.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      role.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetailsModal(role)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View
                      </button>
                      <PermissionControl permissions={['Role.Edit']}>
                        <button
                          onClick={() => openEditModal(role)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Edit
                        </button>
                      </PermissionControl>
                      <PermissionControl permissions={['Role.Delete']}>
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </PermissionControl>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              {modalMode === 'create' ? 'Create Role' : 'Edit Role'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Finance Manager"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Group *
                  </label>
                  <select
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Role description..."
                  />
                </div>
              </div>
              {formError && (
                <div className="text-sm text-red-600 dark:text-red-400 mb-2">{formError}</div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {modalMode === 'create' ? 'Create' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl my-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {detailsRole.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {detailsRole.groupName} • Created {new Date(detailsRole.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {detailsRole.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-6">{detailsRole.description}</p>
            )}

            {/* Permissions Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Permissions
              </h3>
              <div className="border border-gray-300 dark:border-gray-600 rounded p-4 max-h-64 overflow-y-auto">
                {allPermissions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Loading permissions...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {allPermissions.map((perm, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={rolePermissions.some(p => p.key === perm)}
                          onChange={() => {
                            // Toggle mock permission (in real scenario, find permissionId)
                            const mockPermId = idx + 1;
                            togglePermission(mockPermId);
                          }}
                          className="rounded"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{perm}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <PermissionControl permissions={['Role.Manage']}>
                <button
                  onClick={handleSavePermissions}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save Permissions
                </button>
              </PermissionControl>
            </div>

            {/* Users Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Assigned Users ({roleUsers.length})
              </h3>
              <div className="border border-gray-300 dark:border-gray-600 rounded p-4 max-h-48 overflow-y-auto mb-3">
                {roleUsers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No users assigned</p>
                ) : (
                  <div className="space-y-2">
                    {roleUsers.map((user: any) => (
                      <div key={user.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {user.name || user.email}
                        </span>
                        <PermissionControl permissions={['Role.Manage']}>
                          <button
                            onClick={() => handleRemoveUser(user.id, user.name || user.email)}
                            className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        </PermissionControl>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <PermissionControl permissions={['Role.Manage']}>
                <div className="flex gap-2">
                  <select
                    multiple
                    value={selectedUserIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (opt: HTMLOptionElement) => opt.value);
                      setSelectedUserIds(selected);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    size={4}
                  >
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignUsers}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Assign Users
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Hold Ctrl/Cmd to select multiple users
                </p>
              </PermissionControl>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
