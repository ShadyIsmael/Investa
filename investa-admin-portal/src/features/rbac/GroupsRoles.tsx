import React, { useEffect, useState } from 'react';
import { groupService } from '@/services/groupService';
import type { Group, Role } from '@/types';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { Icon } from '@/components/common/Icons';
import PermissionControl from '@/components/common/PermissionControl';
import { useTranslation } from 'react-i18next';

export const GroupsRoles: React.FC<{ mode?: 'groups' | 'roles' | 'all' }> = ({ mode }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const isGroupsOnly = mode === 'groups';

  // Groups pagination with search
  const [groupPage, setGroupPage] = useState(1);
  const [groupPageSize, setGroupPageSize] = useState(8);
  const [groupSearch, setGroupSearch] = useState('');
  const filteredGroups = (groups || []).filter(g => {
    const q = groupSearch.trim().toLowerCase();
    if (!q) return true;
    return (g.name || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q);
  });
  const totalGroupPages = Math.max(1, Math.ceil(filteredGroups.length / groupPageSize));
  useEffect(() => {
    if (groupPage > totalGroupPages) setGroupPage(totalGroupPages);
  }, [filteredGroups.length, groupPageSize, totalGroupPages]);
  useEffect(() => { setGroupPage(1); }, [groupSearch, groupPageSize]);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [memberModalGroup, setMemberModalGroup] = useState<Group | null>(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [gs, rs] = await Promise.all([groupService.getGroups(), groupService.getRoles()]);
      setGroups(gs || []);
      setRoles(rs || []);
      // try load up to 500 users for assignment
      try {
        const u = await userService.getUsers({ page: 1, pageSize: 500 });
        setUsers(u.items || []);
      } catch (e) {
        setUsers([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const openNewGroup = () => { setEditingGroup({ id: 0, name: '', description: null, slug: null, parentGroupId: null, memberCount: 0, membersSample: [], permissions: [], status: 'Active', createdAt: new Date().toISOString(), updatedAt: null, metadata: {}, roleIds: [], members: [] }); setShowGroupModal(true); };

  const saveGroup = async (g: Group) => {
    if (!g.name.trim()) { showToast('Group name is required', 'error'); return; }
    // prevent duplicate group names (case-insensitive)
    const duplicate = groups.some(x => x.name.trim().toLowerCase() === g.name.trim().toLowerCase() && x.id !== g.id);
    if (duplicate) { showToast('Group name already exists', 'error'); return; }

    if (g.id === 0) {
      const created = await groupService.createGroup({ name: g.name, description: g.description });
      setGroups(prev => [created, ...prev]);
      showToast('Group created', 'success');
    } else {
      const updated = await groupService.updateGroup(g.id, g);
      setGroups(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast('Group updated', 'success');
    }
    setShowGroupModal(false);
    setEditingGroup(null);
  };

  const deleteGroup = async (id: number) => {
    if (!confirm('Delete group?')) return;
    await groupService.deleteGroup(id);
    setGroups(prev => prev.filter(g=>g.id !== id));
    showToast('Group deleted', 'success');
  };

  const [roleSearch, setRoleSearch] = useState('');
  const [roleGroupFilter, setRoleGroupFilter] = useState<number>(0); // 0 = all, -1 = SuperAdmin (no group)

  const filteredRoles = (roles || []).filter(r => {
    const matchesGroup = roleGroupFilter === 0 || 
                        (roleGroupFilter === -1 && !r.groupId) || 
                        r.groupId === roleGroupFilter;
    const q = roleSearch.trim().toLowerCase();
    if (!q) return matchesGroup;
    return matchesGroup && (
      (r.name || '').toLowerCase().includes(q) || 
      (r.description || '').toLowerCase().includes(q) ||
      (r.groupName || '').toLowerCase().includes(q)
    );
  });

  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());
  const [assignedSearch, setAssignedSearch] = useState('');
  const [movingToAssigned, setMovingToAssigned] = useState<Set<string>>(new Set());
  const [movingToAvailable, setMovingToAvailable] = useState<Set<string>>(new Set());

  const getFiltersKey = (roleId: number | string) => `investa:role-filters:${roleId}`;

  const openRoleModal = (r?: Role) => {
    const initial = r ? { 
      ...r, 
      members: r.members || [],
      groupId: r.groupId ?? null,
      groupName: r.groupName
    } : { 
      id: 0, 
      name: '', 
      description: '', 
      // Require explicit selection when creating a new role; undefined == not selected
      groupId: undefined as number | null | undefined,
      groupName: undefined,
      isActive: false,
      createdAt: new Date().toISOString(),
      members: [] 
    };
    setEditingRole(initial);

    // Restore filters for this role if present
    if (initial && initial.id) {
      try {
        const raw = localStorage.getItem(getFiltersKey(initial.id));
        if (raw) {
          const parsed = JSON.parse(raw);
          setRoleSearch(parsed.roleSearch || '');
          setAssignedSearch(parsed.assignedSearch || '');
        } else {
          setRoleSearch('');
          setAssignedSearch('');
        }
      } catch (e) {
        setRoleSearch('');
        setAssignedSearch('');
      }
    } else {
      setRoleSearch('');
      setAssignedSearch('');
    }

    setSelectedAvailable(new Set());
    setSelectedAssigned(new Set());
    setMovingToAssigned(new Set());
    setMovingToAvailable(new Set());
    setShowRoleModal(true);
  };

  const getAvailableUsers = () => {
    if (!editingRole) return [] as User[];
    const assigned = new Set((editingRole.members || []).map(String));
    return users.filter(u => !assigned.has(u.id) && (roleSearch.trim() === '' || u.name.toLowerCase().includes(roleSearch.toLowerCase()) || u.email.toLowerCase().includes(roleSearch.toLowerCase())));
  };

  const getAssignedUsers = () => {
    if (!editingRole) return [] as User[];
    const assigned = new Set((editingRole.members || []).map(String));
    return users.filter(u => assigned.has(u.id) && (assignedSearch.trim() === '' || u.name.toLowerCase().includes(assignedSearch.toLowerCase()) || u.email.toLowerCase().includes(assignedSearch.toLowerCase())));
  };

  const moveToAssigned = () => {
    if (!editingRole || selectedAvailable.size === 0) return;
    // animate items moving right
    setMovingToAssigned(new Set(selectedAvailable));
    // after animation, update actual members
    setTimeout(() => {
      const nextMembers = new Set((editingRole.members || []).map(String));
      selectedAvailable.forEach(id => nextMembers.add(id));
      setEditingRole(prev => prev ? { ...prev, members: Array.from(nextMembers) } : prev);
      setSelectedAvailable(new Set());
      setMovingToAssigned(new Set());
    }, 200);
  };

  const moveToAvailable = () => {
    if (!editingRole || selectedAssigned.size === 0) return;
    // animate items moving left
    setMovingToAvailable(new Set(selectedAssigned));
    setTimeout(() => {
      const nextMembers = new Set((editingRole.members || []).map(String));
      selectedAssigned.forEach(id => nextMembers.delete(id));
      setEditingRole(prev => prev ? { ...prev, members: Array.from(nextMembers) } : prev);
      setSelectedAssigned(new Set());
      setMovingToAvailable(new Set());
    }, 200);
  };

  const selectAllVisible = () => {
    if (!editingRole) return;
    const next = new Set<string>((editingRole.members || []).map(String));
    getAvailableUsers().forEach(u => next.add(u.id));
    setEditingRole(prev => prev ? { ...prev, members: Array.from(next) } : prev);
  };

  const selectAllAcrossAvailable = () => {
    if (!editingRole) return;
    // selects all users available across pages
    setSelectedAvailable(new Set(users.map(u => u.id)));
  };

  const selectAllAcrossAssigned = () => {
    if (!editingRole) return;
    const assigned = new Set((editingRole.members || []).map(String));
    setSelectedAssigned(new Set(Array.from(assigned)));
  };

  const clearAll = () => {
    if (!editingRole) return;
    // clear selection and assigned members
    setSelectedAvailable(new Set());
    setSelectedAssigned(new Set());
    setEditingRole(prev => prev ? { ...prev, members: [] } : prev);
  };

  // Persist role search filters per role while modal is open/closed
  useEffect(() => {
    if (!editingRole || !editingRole.id) return;
    const payload = { roleSearch, assignedSearch };
    try { localStorage.setItem(getFiltersKey(editingRole.id), JSON.stringify(payload)); } catch (e) { }
  }, [roleSearch, assignedSearch, editingRole && editingRole.id]);
  const saveRole = async (r: Role) => {
    if (!r.name.trim()) { showToast('Role name is required', 'error'); return; }
    // Validate group selection for newly created roles (must explicitly select Group or SuperAdmin)
    if (!r.id || Number(r.id) === 0 || (r.groupId === undefined)) {
      showToast('Please select a Group or SuperAdmin', 'error'); 
      return;
    }
    // prevent duplicate role names within same group
    const duplicate = roles.some(x => 
      x.name.trim().toLowerCase() === r.name.trim().toLowerCase() && 
      x.id !== r.id &&
      x.groupId === r.groupId
    );
    if (duplicate) { 
      showToast(`Role name already exists in this ${r.groupId ? 'group' : 'system-wide scope'}`, 'error'); 
      return; 
    }
    // ensure members is an array of numbers
    const members = (r.members || []).map(m => Number(m));
    const payload = { 
      name: r.name, 
      description: r.description, 
      groupId: r.groupId,
      groupName: r.groupName,
      members 
    };
    if (!r.id || Number(r.id) === 0) {
      const created = await groupService.createRole(payload);
      setRoles(prev => [created, ...prev]);
      showToast('Role created', 'success');
    } else {
      const updated = await groupService.updateRole(String(r.id), payload);
      setRoles(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast('Role updated', 'success');
    }
    setShowRoleModal(false);
    setEditingRole(null);
  };

  const deleteRole = async (id: string | number) => {
    if (!confirm('Delete role?')) return;
    await groupService.deleteRole(String(id));
    setRoles(prev => prev.filter(r=>r.id !== id));
    showToast('Role deleted', 'success');
  };

  const openMemberModal = (g: Group) => { setMemberModalGroup(g); };

  const saveMembers = async (groupId: number, members: { userId: string | number; roleId?: string | number }[]) => {
    // Validate that each selected member has a role assigned
    const missing = members.some(m => !m.roleId);
    if (missing) { showToast('Please assign a role to every member', 'error'); return; }
    const updated = await groupService.assignMembersToGroup(groupId, members);
    setGroups(prev => prev.map(g => g.id === groupId ? updated : g));
    setMemberModalGroup(null);
    showToast('Members updated', 'success');
  };

  if (loading) return <div className="h-[40vh] flex items-center justify-center">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{isGroupsOnly ? t('rbac.groups', { defaultValue: 'Groups' }) : t('pages.groupsAndRoles', { defaultValue: 'Groups & Roles' })}</h2>
          <p className="text-slate-500 text-sm">{isGroupsOnly ? t('pages.groupsDescription', { defaultValue: 'Manage user groups.' }) : t('pages.groupsAndRolesDescription', { defaultValue: 'Manage user groups, role definitions and assignments.' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openNewGroup} className="px-2 py-1 bg-indigo-600 text-white rounded-md text-sm">New Group</button>
          {!isGroupsOnly && <button onClick={() => openRoleModal()} className="px-2 py-1 border rounded-md text-sm">New Role</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-4">
          <h3 className="font-bold mb-3">Groups</h3>
          <div className="mb-3 flex items-center gap-3">
            <input value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} placeholder="Search groups by name or description..." className="px-2 py-1 rounded-md border text-sm w-full sm:w-64" />
            {groupSearch && <button type="button" onClick={() => setGroupSearch('')} className="px-2 py-1 border rounded-md text-sm">Clear</button>}
          </div>

          <div className="overflow-x-auto">
            <div className="border rounded-md">
              <table className="min-w-full text-left">
                <thead className="text-slate-500 text-sm uppercase text-[11px] tracking-widest sticky top-0 bg-white dark:bg-slate-900">
                  <tr>
                    <th className="px-2 py-1">Group</th>
                    <th className="px-2 py-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const start = (groupPage - 1) * groupPageSize;
                    const pageItems = filteredGroups.slice(start, start + groupPageSize);
                    if (!pageItems.length) {
                      return (
                        <tr>
                          <td colSpan={2} className="px-2 py-4 text-center text-sm text-slate-500">No groups found.</td>
                        </tr>
                      );
                    }
                    return pageItems.map(g => (
                      <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="px-2 py-1">
                          <div className="font-semibold">{g.name}</div>
                          <div className="text-sm text-slate-400">{g.description}</div>
                          <div className="text-xs text-slate-500 mt-1">Members: {(g.members || []).length}{(g.permissions && g.permissions.length) ? ` • Permissions: ${g.permissions.length}` : ''}</div>
                        </td>
                        <td className="px-2 py-1 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <PermissionControl permission="Group.Edit">
                              <button onClick={() => { setEditingGroup(g); setShowGroupModal(true); }} className="px-2 py-1 bg-indigo-600 text-white rounded-md text-sm">Modify</button>
                            </PermissionControl>
                            <PermissionControl permission="Group.View">
                              <button onClick={() => openMemberModal(g)} className="px-2 py-1 border rounded-md text-sm">Members</button>
                            </PermissionControl>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                Showing {(filteredGroups.length === 0) ? 0 : ( (groupPage - 1) * groupPageSize + 1 )}–{Math.min(filteredGroups.length, groupPage * groupPageSize)} of {filteredGroups.length}
              </div>
              <div className="flex items-center gap-2">
                <select value={groupPageSize} onChange={(e) => { setGroupPageSize(Number(e.target.value)); setGroupPage(1); }} className="px-2 py-1 border rounded-md text-sm">
                  {[5,8,10,20].map(s => <option key={s} value={s}>{s} / page</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={() => setGroupPage(1)} disabled={groupPage === 1} className="px-2 py-1 border rounded-md text-sm">First</button>
                  <button onClick={() => setGroupPage(p => Math.max(1, p - 1))} disabled={groupPage === 1} className="px-2 py-1 border rounded-md text-sm">Prev</button>
                  <div className="px-2 py-1">{groupPage} / {totalGroupPages}</div>
                  <button onClick={() => setGroupPage(p => Math.min(totalGroupPages, p + 1))} disabled={groupPage === totalGroupPages} className="px-2 py-1 border rounded-md text-sm">Next</button>
                  <button onClick={() => setGroupPage(totalGroupPages)} disabled={groupPage === totalGroupPages} className="px-2 py-1 border rounded-md text-sm">Last</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isGroupsOnly && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border p-4">
          <h3 className="font-bold mb-3">Roles</h3>
          
          {/* Search and Filter */}
          <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input 
              value={roleSearch} 
              onChange={(e) => setRoleSearch(e.target.value)} 
              placeholder="Search roles by name or description..." 
              className="px-2 py-1 rounded-md border text-sm w-full sm:w-64" 
            />
            <select
              value={roleGroupFilter}
              onChange={(e) => setRoleGroupFilter(Number(e.target.value))}
              className="px-2 py-1 rounded-md border text-sm w-full sm:w-48"
            >
              <option value={0}>All Groups</option>
              <option value={-1}>SuperAdmin (No Group)</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {(roleSearch || roleGroupFilter !== 0) && (
              <button 
                type="button" 
                onClick={() => { setRoleSearch(''); setRoleGroupFilter(0); }} 
                className="px-2 py-1 border rounded-md text-sm"
              >
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-slate-500 text-sm uppercase text-[11px] tracking-widest">
                <tr>
                  <th className="px-2 py-1">Role</th>
                  <th className="px-2 py-1">Group</th>
                  <th className="px-2 py-1">Description</th>
                  <th className="px-2 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map(r => {
                  const group = r.groupId ? groups.find(g => g.id === r.groupId) : null;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-2 py-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-sm">{r.name}</div>
                          <div className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">{(r.members || []).length} members</div>
                        </div>
                      </td>
                      <td className="px-2 py-1">
                        {group ? (
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">
                            {group.name}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg">
                            SuperAdmin
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-sm">{r.description}</td>
                      <td className="px-2 py-1 text-right">
                        <PermissionControl permission="Role.Edit">
                          <button onClick={() => openRoleModal(r)} className="text-indigo-600 mr-2 text-sm">Edit</button>
                        </PermissionControl>
                        <PermissionControl permission="Role.Delete">
                          <button onClick={() => deleteRole(r.id)} className="text-rose-600 text-sm">Delete</button>
                        </PermissionControl>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowGroupModal(false); setEditingGroup(null); }} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border p-6">
            <h3 className="font-bold mb-4">{editingGroup.id === 0 ? 'New Group' : 'Edit Group'}</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-bold">Name</label>
                <input value={editingGroup.name} onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : prev)} className="w-full mt-2 px-3 py-2 rounded-lg border" />
              </div>

              <div>
                <label className="text-sm font-bold">Description</label>
                <textarea value={editingGroup.description} onChange={(e) => setEditingGroup(prev => prev ? { ...prev, description: e.target.value } : prev)} className="w-full mt-2 px-3 py-2 rounded-lg border" />
              </div>

            </div>

            <div className="mt-4 flex justify-between items-center gap-3">
              <div>
                {editingGroup.id !== 0 && (
                  <PermissionControl permission="Group.Delete">
                    <button onClick={() => { if (confirm('Delete group?')) { deleteGroup(editingGroup.id); setShowGroupModal(false); setEditingGroup(null); } }} className="px-3 py-1 border rounded-lg text-rose-600">Delete Group</button>
                  </PermissionControl>
                )}
              </div>
              <div>
                <button onClick={() => { setShowGroupModal(false); setEditingGroup(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={() => saveGroup(editingGroup)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save Group</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {memberModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMemberModalGroup(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl border p-6">
            <h3 className="font-bold mb-4">Manage Members — {memberModalGroup.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
              {users.map(u => {
                const mem = (memberModalGroup.members || []).find(m => m.userId === u.id);
                const checked = !!mem;
                return (
                  <div key={u.id} className="flex items-center gap-3 p-2 border rounded-lg">
                    <input type="checkbox" checked={checked} onChange={(e) => {
                      const next = new Map<string | number, string | number | undefined>((memberModalGroup.members || []).map(m => [m.userId, m.roleId]));
                      if (e.target.checked) next.set(u.id, roles[0]?.id); else next.delete(u.id);
                      const arr = Array.from(next.entries()).map(([userId, roleId]) => ({ userId, roleId }));
                      setMemberModalGroup(prev => prev ? { ...prev, members: arr } : prev);
                    }} />

                    <div className="flex-1">
                      <div className="font-bold">{u.name}</div>
                      <div className="text-sm text-slate-500">{u.email}</div>
                    </div>

                    <div className="w-40">
                      <select disabled={!checked} value={mem?.roleId ?? ''} onChange={(e) => {
                        const roleId = e.target.value ? Number(e.target.value) : undefined;
                        const next = new Map<string | number, string | number | undefined>((memberModalGroup.members || []).map(m => [m.userId, m.roleId]));
                        if (!next.has(u.id) && roleId !== undefined) next.set(u.id, roleId);
                        else if (next.has(u.id)) next.set(u.id, roleId);
                        const arr = Array.from(next.entries()).map(([userId, roleId]) => ({ userId, roleId }));
                        setMemberModalGroup(prev => prev ? { ...prev, members: arr } : prev);
                      }} className="w-full px-2 py-1 rounded-lg border">
                        <option value="">Select role</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setMemberModalGroup(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={() => saveMembers(memberModalGroup.id, memberModalGroup.members || [])} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Save Members</button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && editingRole && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowRoleModal(false); setEditingRole(null); }} />
          <div className="relative right-0 top-0 h-full w-full max-w-[720px] sm:max-w-[640px] bg-white dark:bg-slate-900 rounded-l-2xl border-l border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-right-2 duration-300">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-lg">{editingRole.id === 0 ? 'Create Role' : 'Edit Role'}</h3>
                <div className="text-sm text-slate-500 mt-1">Define the role and assign users</div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="text-xs text-slate-500 hidden sm:block">{(editingRole.members || []).length} members</div>
                <button onClick={() => { setShowRoleModal(false); setEditingRole(null); }} aria-label="Close" className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                  <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-bold">Name <span className="text-red-500">*</span></label>
                  <input value={editingRole.name} onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : prev)} className="w-full mt-2 px-3 py-2 rounded-lg border" />
                </div>

                <div>
                  <label className="text-sm font-bold">Description</label>
                  <textarea value={editingRole.description} onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : prev)} className="w-full mt-2 px-3 py-2 rounded-lg border" />
                </div>

                <div>
                  <label className="text-sm font-bold">
                    Group / Department <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={editingRole.groupId ?? ''} 
                    onChange={(e) => {
                      const raw = e.target.value;
                      const val = raw === '' ? undefined : Number(raw);
                      setEditingRole(prev => prev ? { 
                        ...prev, 
                        groupId: val === -1 ? null : val,
                        groupName: val === -1 || val === undefined ? undefined : groups.find(g => g.id === val)?.name
                      } : prev);
                    }} 
                    className="w-full mt-2 px-3 py-2 rounded-lg border"
                  >
                    <option value="">-- Select Group (required) --</option>
                    <option value={-1}>SuperAdmin (No Group - System-wide)</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Select a group to bind this role to a specific department. Only select &quot;SuperAdmin&quot; for system-wide administrative roles.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold">Assign Members</label>
                  <div className="mt-3 grid grid-cols-12 gap-3 items-start">
                    {/* Available Users */}
<div className="col-span-5 bg-white dark:bg-slate-900 p-2 rounded-md border">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="font-medium text-sm">Available <span className="text-xs text-slate-400">({getAvailableUsers().length})</span></div>
                        <div className="flex items-center gap-2 text-xs">
                          <button type="button" onClick={selectAllAcrossAvailable} className="px-2 py-0.5 border rounded-md">Select all</button>
                          <button type="button" onClick={() => setSelectedAvailable(new Set())} className="px-2 py-0.5 border rounded-md">Clear</button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <input value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)} placeholder="Search available users..." className="w-full px-2 py-1.5 rounded-md border text-sm" />
                      </div>
                      <div className="h-[24vh] sm:h-[26vh] overflow-y-auto divide-y">
                        {getAvailableUsers().map(u => (
                          <label key={u.id} className={`flex items-center gap-3 p-2 transition-all duration-150 ${movingToAssigned.has(u.id) ? 'opacity-50 translate-x-4' : ''}`}>
                            <input type="checkbox" className="w-4 h-4" checked={selectedAvailable.has(u.id)} onChange={(e)=>{
                              const next = new Set<string>(selectedAvailable);
                              if (e.target.checked) next.add(u.id); else next.delete(u.id);
                              setSelectedAvailable(next);
                            }} />
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Arrows */}
                    <div className="col-span-1 flex flex-col items-center justify-center gap-2">
                      <button aria-label="assign selected" type="button" onClick={() => moveToAssigned()} className="p-1.5 bg-indigo-600 text-white rounded-md shadow-sm"> 
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button aria-label="remove selected" type="button" onClick={() => moveToAvailable()} className="p-1.5 border rounded-md"> 
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 6l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button aria-label="clear selection" type="button" onClick={() => { setSelectedAvailable(new Set()); setSelectedAssigned(new Set()); }} className="text-xs text-slate-500">Clear</button>
                    </div>

                    {/* Assigned Users */}
                    <div className="col-span-6 bg-white dark:bg-slate-900 p-3 rounded-md border">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="font-medium text-sm">Assigned <span className="text-xs text-slate-400">({getAssignedUsers().length})</span></div>
                        <div className="flex items-center gap-2 text-sm">
                          <button type="button" onClick={selectAllAcrossAssigned} className="px-2 py-1 border rounded-md">Select all</button>
                          <button type="button" onClick={() => setSelectedAssigned(new Set())} className="px-2 py-1 border rounded-md">Clear</button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <input value={assignedSearch} onChange={(e) => setAssignedSearch(e.target.value)} placeholder="Search assigned users..." className="w-full px-2 py-2 rounded-md border text-sm" />
                      </div>
                      <div className="h-[30vh] sm:h-[32vh] overflow-y-auto divide-y">
                        {getAssignedUsers().map(u => (
                          <label key={u.id} className={`flex items-center gap-3 p-2 transition-all duration-150 ${movingToAvailable.has(u.id) ? 'opacity-50 -translate-x-4' : ''}`}>
                            <input type="checkbox" className="w-4 h-4" checked={selectedAssigned.has(u.id)} onChange={(e)=>{
                              const next = new Set<string>(selectedAssigned);
                              if (e.target.checked) next.add(u.id); else next.delete(u.id);
                              setSelectedAssigned(next);
                            }} />
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="sticky bottom-0 p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
              <div>
                {editingRole.id !== 0 && (
                  <PermissionControl permission="Role.Delete">
                    <button onClick={() => { if (confirm('Delete role?')) { deleteRole(editingRole.id); setShowRoleModal(false); setEditingRole(null); } }} className="px-2 py-1 border rounded-md text-rose-600 text-sm">Delete Role</button>
                  </PermissionControl>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowRoleModal(false); setEditingRole(null); }} className="px-3 py-1 border rounded-md text-sm">Cancel</button>
                <button onClick={() => saveRole(editingRole)} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Save Role</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className={`fixed right-6 top-24 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-bold ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default GroupsRoles;
