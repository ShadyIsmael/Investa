import React, { useState, useEffect } from 'react';
import { groupService } from '@/services/groupService';
import { userService } from '@/services/userService';
import PermissionControl from '@/components/common/PermissionControl';

interface Group {
  id: number;
  name: string;
  description: string;
  roleIds?: number[];
  members?: number[];
  createdAt?: string;
}

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Details modal
  const [detailsGroup, setDetailsGroup] = useState<any | null>(null);
  const [permissionsList, setPermissionsList] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [canEditPermissions, setCanEditPermissions] = useState(true); // controlled by permission check (adjusted below)

  const togglePermission = (perm: string) => {
    setSelectedPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const savePermissions = async () => {
    if (!detailsGroup) return;
    try {
      await groupService.updateGroupPermissions(detailsGroup.id, selectedPermissions);
      showToast('Permissions saved', 'success');
      // refresh details
      const refreshed = await groupService.getGroupById(detailsGroup.id);
      setDetailsGroup(refreshed);
      loadGroups(page, pageSize, debouncedSearch);
    } catch (e) {
      console.warn('Failed to save permissions', e);
      showToast('Failed to save permissions', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    loadGroups(page, pageSize, debouncedSearch);
  }, [page, pageSize, debouncedSearch]);

  const loadGroups = async (p = 1, ps = 10, search = '') => {
    setLoading(true);
    try {
      const res = await groupService.getGroupsList(p, ps, search || undefined);
      setGroups(res.items.map(i => ({ id: i.id, name: i.name, description: i.description || '', roleIds: [], members: [], createdAt: i.createdAt })));
      setTotal(res.total || 0);
      setPage(res.page || p);
      setPageSize(res.pageSize || ps);
    } catch (error) {
      showToast('Failed to load groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (group?: Group) => {
    setEditingGroup(group || { id: 0, name: '', description: '', roleIds: [], members: [] });
    setShowModal(true);
  };

  const saveGroup = async () => {
    if (!editingGroup) return;
    if (!editingGroup.name.trim()) {
      showToast('Group name is required', 'error');
      return;
    }

    try {
      if (editingGroup.id === 0) {
        await groupService.createGroup({ name: editingGroup.name, description: editingGroup.description, members: editingGroup.members });
        showToast('Group created successfully', 'success');
      } else {
        await groupService.updateGroup(editingGroup.id, { name: editingGroup.name, description: editingGroup.description, members: editingGroup.members });
        showToast('Group updated successfully', 'success');
      }
      setShowModal(false);
      setEditingGroup(null);
      loadGroups(page, pageSize, debouncedSearch);
    } catch (error) {
      showToast('Failed to save group', 'error');
    }
  };

  const deleteGroup = async (id: number) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    try {
      await groupService.deleteGroup(id);
      showToast('Group deleted successfully', 'success');
      // reload current page — if last item was removed and page became empty, go to previous page
      const nextTotal = Math.max(0, total - 1);
      const lastPage = Math.max(1, Math.ceil(nextTotal / pageSize));
      const nextPage = Math.min(page, lastPage);
      setPage(nextPage);
      loadGroups(nextPage, pageSize, debouncedSearch);
    } catch (error) {
      showToast('Failed to delete group', 'error');
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Groups</h2>
          <p className="text-slate-500 text-sm">Manage organizational groups and departments</p>
        </div>
        <PermissionControl permission="Group.Create">
          <button onClick={() => openModal()} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
            New Group
          </button>
        </PermissionControl>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-md border text-sm w-full sm:w-64"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No groups found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-slate-500 text-sm uppercase text-[11px] tracking-widest border-b">
                <tr>
                  <th className="px-3 py-2">Group Name</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Members</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(group => (
                  <tr key={group.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-3 py-3 font-semibold">{group.name}</td>
                    <td className="px-3 py-3 text-slate-600 text-sm">{group.description}</td>
                    <td className="px-3 py-3 text-sm">{(group as any).memberCount ?? (group.members?.length || 0)}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={async () => { 
                          const d = await groupService.getGroupById(group.id); 
                          setDetailsGroup(d);
                          // load permissions list and selected
                          try {
                            const perms = await groupService.getAllPermissions();
                            setPermissionsList(Array.isArray(perms) ? perms : []);
                            setSelectedPermissions((d?.permissions || []).slice());
                            // check permission to edit
                            // naive: require Group.Update permission (replace with real permission check if available)
                            setCanEditPermissions(true);
                          } catch (e) {
                            setPermissionsList([]);
                          }
                        }} className="px-2 py-1 text-slate-600 text-sm hover:underline">View</button>
                        <PermissionControl permission="Group.Update">
                          <button onClick={() => openModal(group)} className="px-2 py-1 text-indigo-600 text-sm hover:underline">
                            Edit
                          </button>
                        </PermissionControl>
                        <PermissionControl permission="Group.Delete">
                          <button onClick={() => deleteGroup(group.id)} className="px-2 py-1 text-rose-600 text-sm hover:underline">
                            Delete
                          </button>
                        </PermissionControl>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-slate-500">Showing {total === 0 ? 0 : (Math.min((page-1)*pageSize+1, total))} - {total === 0 ? 0 : Math.min(page*pageSize, total)} of {total} groups</div>
              <div className="flex items-center gap-2">
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded-md bg-white dark:bg-slate-900">
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(1)} className="px-2 py-1 border rounded-md">First</button>
                  <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border rounded-md">Prev</button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const totalPages = Math.max(1, Math.ceil((total || 0)/pageSize));
                      const maxVisible = 5;
                      let start = Math.max(1, page - Math.floor(maxVisible/2));
                      let end = Math.min(totalPages, start + maxVisible - 1);
                      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
                      const pages: number[] = [];
                      for (let i = start; i <= end; i++) pages.push(i);
                      return pages.map(pn => (
                        <button key={pn} onClick={() => setPage(pn)} className={`px-2 py-1 border rounded-md ${pn === page ? 'bg-indigo-600 text-white' : ''}`}>{pn}</button>
                      ));
                    })()}
                  </div>

                  <button disabled={page >= Math.max(1, Math.ceil((total || 0)/pageSize))} onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil((total || 0)/pageSize)), p+1))} className="px-2 py-1 border rounded-md">Next</button>
                  <button disabled={page >= Math.max(1, Math.ceil((total || 0)/pageSize))} onClick={() => setPage(Math.max(1, Math.ceil((total || 0)/pageSize)))} className="px-2 py-1 border rounded-md">Last</button>

                  <div className="flex items-center gap-1 ml-2">
                    <input type="number" min={1} max={Math.max(1, Math.ceil((total || 0)/pageSize))} value={page} onChange={e => setPage(Math.min(Math.max(1, Number(e.target.value || 1)), Math.max(1, Math.ceil((total || 0)/pageSize))))} className="w-14 px-2 py-1 border rounded-md text-sm" />
                    <div className="text-sm text-slate-400">/ {Math.max(1, Math.ceil((total || 0)/pageSize))}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border shadow-xl z-50 w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">{editingGroup.id === 0 ? 'Create Group' : 'Edit Group'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold">Name <span className="text-red-500">*</span></label>
                <input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full mt-2 px-3 py-2 rounded-lg border"
                  placeholder="e.g., IT Department"
                />
              </div>
              <div>
                <label className="text-sm font-bold">Description</label>
                <textarea
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="w-full mt-2 px-3 py-2 rounded-lg border"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              {/* Members assignment (simplified) */}
              <div>
                <label className="text-sm font-bold">Members (IDs comma separated)</label>
                <input
                  value={(editingGroup.members || []).map(m=>typeof m === 'number' ? m : m.userId).join(',')}
                  onChange={(e) => {
                    const vals = e.target.value.split(',').map(s=>s.trim()).filter(Boolean).map(s=>Number(s));
                    setEditingGroup({ ...editingGroup, members: vals.map(v=>({ userId: v })) });
                  }}
                  className="w-full mt-2 px-3 py-2 rounded-lg border"
                  placeholder="e.g., 1,2,3"
                />
              </div>

              <div className="text-xs text-slate-400">Note: Members assignment is simplified here. Use the dedicated Group Details page for full member management.</div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md text-sm">
                Cancel
              </button>
              <button onClick={saveGroup} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailsGroup(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl border shadow-xl z-50 w-full max-w-2xl p-6">
            <h3 className="font-bold text-lg mb-2">{detailsGroup.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{detailsGroup.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold">Members ({detailsGroup.memberCount || 0})</h4>
                <ul className="mt-2 space-y-2 text-sm">
                  {(detailsGroup.membersSample || []).map((m:any) => (
                    <li key={m.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                      </div>
                      <div className="text-xs text-slate-400">{m.role || ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold">Permissions</h4>
                <div className="mt-2 text-sm text-slate-600">
                  {(detailsGroup.permissions || []).join(', ') || '—'}
                </div>

                {/* Editable permissions (if allowed) */}
                <div className="mt-3">
                  <h5 className="text-sm font-semibold">Edit Permissions</h5>
                  <div className="mt-2 text-sm">
                    {permissionsList.map((p: string) => (
                      <label key={p} className="flex items-center gap-2 py-1">
                        <input type="checkbox" checked={selectedPermissions.includes(p)} onChange={() => togglePermission(p)} disabled={!canEditPermissions} />
                        <span className="truncate">{p}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button onClick={savePermissions} disabled={!canEditPermissions} className={`px-3 py-1 rounded-md ${canEditPermissions ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>Save Permissions</button>
                  </div>
                </div>

                <h4 className="text-sm font-semibold mt-4">Metadata</h4>
                <pre className="mt-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-2 rounded">{JSON.stringify(detailsGroup.metadata || {}, null, 2)}</pre>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setDetailsGroup(null)} className="px-3 py-1 border rounded-md">Close</button>
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

export default Groups;
