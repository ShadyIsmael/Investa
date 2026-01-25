import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import UserOnboarding from '@/components/UserOnboarding';
import PermissionControl from '@/components/common/PermissionControl';
import { toast } from 'react-toastify';

/**
 * UsersList Component
 * Displays and manages organizational users with filtering, pagination, and bulk actions
 */
export const UsersList: React.FC = React.memo(() => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Load users with current filters/page
  const load = useCallback(async (p = page, ps = pageSize, q = debouncedQuery, role = roleFilter, status = statusFilter) => {
    setLoading(true);
    try {
      const params: any = { page: p, pageSize: ps };
      if (q) params.search = q;
      if (role) params.roleId = role;
      if (status) params.status = status.toLowerCase();
      const res = await userService.getUsers(params);
      setUsers(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || p);
      setPageSize(res.pageSize || ps);
    } catch (e) {
      setUsers([]);
      setTotal(0);
    } finally { setLoading(false); }
  }, [page, pageSize, debouncedQuery, roleFilter, statusFilter]);

  useEffect(() => { load(1, pageSize, debouncedQuery, roleFilter, statusFilter); }, [debouncedQuery, roleFilter, statusFilter, pageSize]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // When page changes, load specific page
  useEffect(() => { load(page, pageSize, debouncedQuery, roleFilter, statusFilter); }, [page]);

  const handleOpenNew = useCallback(() => { setEditingUser(null); setShowOnboard(true); }, []);
  const handleEdit = useCallback((u: User) => { setEditingUser(u); setShowOnboard(true); }, []);

  const handleDelete = useCallback(async (u: User) => {
    if (!confirm(`Delete user ${u.name}? This action cannot be undone.`)) return;
    try {
      await userService.deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      toast.success('User deleted');
    } catch (err) {
      console.warn('Failed to delete user', err);
      toast.error('Failed to delete user');
    }
  }, []);

  const handleToggleStatus = useCallback(async (u: User) => {
    const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await userService.updateUser(u.id, { status: nextStatus });
      setUsers(prev => prev.map(p => p.id === u.id ? { ...p, status: nextStatus } : p));
      toast.success(`Status updated to ${nextStatus}`);
    } catch (err) {
      console.warn('Failed to update status', err);
      toast.error('Failed to update status');
    }
  }, []);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggleSelect = useCallback((id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]), []);
  const selectAllVisible = useCallback(() => setSelectedIds(users.map(u=>u.id)), [users]);
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return toast.info('No users selected');
    if (!confirm(`Delete ${selectedIds.length} selected users?`)) return;
    try {
      await userService.bulkDelete(selectedIds);
      setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
      clearSelection();
      toast.success('Selected users deleted');
    } catch (err) {
      console.warn('Bulk delete failed', err);
      toast.error('Bulk delete failed');
    }
  }, [selectedIds, clearSelection]);

  const handleBulkUpdateStatus = useCallback(async (status: 'Active' | 'Inactive') => {
    if (selectedIds.length === 0) return toast.info('No users selected');
    try {
      await userService.bulkUpdateStatus(selectedIds, status);
      setUsers(prev => prev.map(u => selectedIds.includes(u.id) ? { ...u, status } : u));
      clearSelection();
      toast.success('Selected users updated');
    } catch (err) {
      console.warn('Bulk update failed', err);
      toast.error('Bulk update failed');
    }
  }, [selectedIds, clearSelection]);

  // CSV Export
  const exportCSV = useCallback((useSelection = true) => {
    const rows = (useSelection ? users.filter(u=>selectedIds.includes(u.id)) : users).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      lastLogin: u.lastLogin,
    }));
    if (rows.length === 0) return toast.info('No users to export');
    const header = Object.keys(rows[0]).join(',') + '\n';
    const body = rows.map(r => Object.values(r).map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const csv = header + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${useSelection ? 'selected' : 'all'}-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [users, selectedIds]);

  // Role / Status options (loaded dynamically)
  const [roleOptions, setRoleOptions] = useState<string[]>(['Admin','Editor','Viewer']);
  const [statusOptions, setStatusOptions] = useState<string[]>(['Active','Inactive','Pending']);

  // Memoized computed values
  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0)/pageSize)), [total, pageSize]);
  const isAllSelected = useMemo(() => selectedIds.length > 0 && selectedIds.length === users.length, [selectedIds.length, users.length]);
  const hasSelection = useMemo(() => selectedIds.length > 0, [selectedIds.length]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [roles, statuses] = await Promise.all([userService.getRoles(), userService.getStatuses()]);
        setRoleOptions(Array.isArray(roles) ? roles : ['Admin','Editor','Viewer']);
        setStatusOptions(Array.isArray(statuses) ? statuses : ['Active','Inactive','Pending']);
      } catch (e) {
        // ignore
      }
    };
    loadOptions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Org Users</h2>
          <p className="text-muted text-sm">Manage internal organizational users and staff</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-md p-2">
            <input
              type="search"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="px-3 py-1 border border-border rounded-md w-64 bg-transparent text-text placeholder-muted"
            />

            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="px-2 py-1 border border-border rounded-md bg-transparent text-text">
              <option value="">All Roles</option>
              {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-2 py-1 border border-border rounded-md bg-transparent text-text">
              <option value="">All Statuses</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkUpdateStatus('Active')} className="px-3 py-1 bg-emerald-600 text-white rounded-md">Activate</button>
                <button onClick={() => handleBulkUpdateStatus('Inactive')} className="px-3 py-1 bg-warning text-white rounded-md">Deactivate</button>
                <button onClick={handleBulkDelete} className="px-3 py-1 bg-error text-white rounded-md">Delete</button>
                <button onClick={() => exportCSV(true)} className="px-3 py-1 bg-muted/20 rounded-md text-text">Export Selected</button>
                <button onClick={clearSelection} className="px-3 py-1 border border-border rounded-md text-text">Clear</button>
              </div>
            )}

            <PermissionControl permission="User.Manage">
              <button onClick={handleOpenNew} className="px-3 py-1 bg-primary text-white rounded-md">New User</button>
            </PermissionControl>

            <button onClick={() => exportCSV(false)} className="px-3 py-1 border border-border rounded-md text-text">Export All</button>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-muted">Loading...</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left">
              <thead className="text-muted text-sm uppercase text-[11px] tracking-widest border-b border-border">
                <tr>
                  <th className="px-3 py-2"><input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === users.length} onChange={(e) => e.target.checked ? selectAllVisible() : clearSelection()} /></th>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Department / Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-sm text-muted">No users found.</td>
                  </tr>
                )}
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-text">{u.name}</div>
                      <div className="text-xs text-muted">{u.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      {u.groupName ? (
                        <div className="text-sm text-text">
                          <span className="font-semibold">{u.groupName}</span>
                          {u.roleName && <span className="text-muted ml-2">• {u.roleName}</span>}
                        </div>
                      ) : (
                        <div className="text-sm text-muted">{u.role || '—'}</div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-surface text-muted border border-border'}`}>{u.status}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PermissionControl permission="User.Manage">
                          <button onClick={() => handleEdit(u)} className="px-2 py-1 border border-border rounded-md text-sm text-text hover:bg-background">Edit</button>
                          <button onClick={() => handleToggleStatus(u)} className="px-2 py-1 border border-border rounded-md text-sm text-text hover:bg-background">{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                          <button onClick={() => handleDelete(u)} className="px-2 py-1 border border-red-200 rounded-md text-sm text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20">Delete</button>
                        </PermissionControl>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-muted">Showing {total === 0 ? 0 : (Math.min((page-1)*pageSize+1, total))} - {total === 0 ? 0 : Math.min(page*pageSize, total)} of {total} users</div>
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
                    <div className="text-sm text-muted">/ {Math.max(1, Math.ceil((total || 0)/pageSize))}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showOnboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowOnboard(false); setEditingUser(null); }} />
          <div className="relative w-full max-w-2xl p-4">
            <UserOnboarding editingUser={editingUser} onClose={(created) => { setShowOnboard(false); setEditingUser(null); if (created) load(); }} />
          </div>
        </div>
      )}
    </div>
  );
});

UsersList.displayName = 'UsersList';

export default UsersList;
