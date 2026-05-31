import React, { useState, useEffect } from 'react';
import { groupService } from '@/services/groupService';
import { NAV_ITEMS } from '@/utils/constants';
import PermissionControl from '@/components/common/PermissionControl';
import { Icon } from '@/components/common/Icons';
import GroupPermissionsEditor from '@/components/GroupPermissionsEditor';
import { useTranslation } from 'react-i18next';

interface Group {
  id: number;
  name: string;
  description: string;
  roleIds?: number[];
  members?: { userId: number; roleId?: number }[];
  createdAt?: string;
}

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
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
      setGroups(res.items.map(i => ({ id: i.id, name: i.name, description: i.description || '', roleIds: [], createdAt: i.createdAt })));
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
    setEditingGroup(group || { id: 0, name: '', description: '', roleIds: [] });
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
        // API does not accept members in create payload - manage members separately
        await groupService.createGroup({ name: editingGroup.name, description: editingGroup.description });
        showToast('Group created successfully', 'success');
      } else {
        await groupService.updateGroup(editingGroup.id, { name: editingGroup.name, description: editingGroup.description });
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
          <h2 className="text-2xl font-bold">{t('rbac.groups', { defaultValue: 'Groups' })}</h2>
          <p className="text-slate-500 text-sm">{t('pages.groupsDescription', { defaultValue: 'Manage organizational groups and departments' })}</p>
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
            className="px-3 py-2 rounded-md border border-border bg-surface text-text text-sm w-full sm:w-64 placeholder-muted"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No groups found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="text-muted-foreground text-sm uppercase text-[11px] tracking-widest border-b border-border">
                <tr>
                  <th className="px-3 py-2">Group Name</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(group => (
                  <tr key={group.id} className="border-b border-border hover:bg-background/50">
                    <td className="px-3 py-3 font-semibold text-text">{group.name}</td>
                      <td className="px-3 py-3 text-muted-foreground text-sm">{group.description}</td>
                      <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={async () => {
                          const d = await groupService.getGroupById(group.id);

                          // Collect all permission keys from navigation items
                          const collect = (items: any[]): string[] => {
                            const out: string[] = [];
                            for (const it of items) {
                              if (Array.isArray(it.permissions)) out.push(...it.permissions);
                              if (Array.isArray(it.children)) out.push(...collect(it.children));
                            }
                            return out;
                          };

                          const allNavPermissions = Array.from(new Set(collect(NAV_ITEMS)));

                          // Ensure backend (or mock) has those permissions created
                          await groupService.ensurePermissionsExist(allNavPermissions);

                          setDetailsGroup(d);
                        }} className="px-2 py-1 text-muted-foreground text-sm hover:text-primary hover:underline">View</button>
                        <PermissionControl permission="Group.Update">
                          <button onClick={() => openModal(group)} className="px-2 py-1 text-primary text-sm hover:underline">
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
              <div className="text-sm text-muted-foreground">Showing {total === 0 ? 0 : (Math.min((page-1)*pageSize+1, total))} - {total === 0 ? 0 : Math.min(page*pageSize, total)} of {total} groups</div>
              <div className="flex items-center gap-2">
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border border-border rounded-md bg-surface text-text">
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

                <div className="flex items-center gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(1)} className="px-2 py-1 border border-border rounded-md bg-surface text-text hover:bg-background disabled:opacity-50">First</button>
                  <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border border-border rounded-md bg-surface text-text hover:bg-background disabled:opacity-50">Prev</button>

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
                        <button key={pn} onClick={() => setPage(pn)} className={`px-2 py-1 border border-border rounded-md ${pn === page ? 'bg-primary text-white border-primary' : 'bg-surface text-text hover:bg-background'}`}>{pn}</button>
                      ));
                    })()}
                  </div>

                  <button disabled={page >= Math.max(1, Math.ceil((total || 0)/pageSize))} onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil((total || 0)/pageSize)), p+1))} className="px-2 py-1 border border-border rounded-md bg-surface text-text hover:bg-background disabled:opacity-50">Next</button>
                  <button disabled={page >= Math.max(1, Math.ceil((total || 0)/pageSize))} onClick={() => setPage(Math.max(1, Math.ceil((total || 0)/pageSize)))} className="px-2 py-1 border border-border rounded-md bg-surface text-text hover:bg-background disabled:opacity-50">Last</button>

                  <div className="flex items-center gap-1 ml-2">
                    <input type="number" min={1} max={Math.max(1, Math.ceil((total || 0)/pageSize))} value={page} onChange={e => setPage(Math.min(Math.max(1, Number(e.target.value || 1)), Math.max(1, Math.ceil((total || 0)/pageSize))))} className="w-14 px-2 py-1 border border-border rounded-md text-sm bg-surface text-text" />
                    <div className="text-sm text-muted-foreground">/ {Math.max(1, Math.ceil((total || 0)/pageSize))}</div>
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
          <div className="relative bg-surface rounded-2xl border border-border shadow-xl z-50 w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4 text-text">{editingGroup.id === 0 ? 'Create Group' : 'Edit Group'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-text">Name <span className="text-red-500">*</span></label>
                <input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-text"
                  placeholder="e.g., IT Department"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-text">Description</label>
                <textarea
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-text"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-md text-sm text-text hover:bg-background">
                Cancel
              </button>
              <button onClick={saveGroup} className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:opacity-90">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailsGroup(null)} />
          <div className="relative bg-surface rounded-2xl border border-border shadow-xl z-50 w-full max-w-2xl p-6 text-text max-h-[85vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-2">{detailsGroup.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{detailsGroup.description}</p>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <h4 className="text-sm font-semibold">Permissions</h4>
                  <div className="mt-2">
                    <GroupPermissionsEditor groupId={detailsGroup.id} initialPermissions={detailsGroup.permissions || []} />
                  </div>
                </div>
              </div>
              <button aria-label="Close" onClick={() => setDetailsGroup(null)} className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 bg-surface border border-border rounded-full text-muted-foreground hover:bg-red-50 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <Icon name="x" className="w-4 h-4" />
              </button>
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
