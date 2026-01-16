import React, { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import { User } from '@/types';
import UserOnboarding from '@/components/UserOnboarding';
import PermissionControl from '@/components/common/PermissionControl';
import { toast } from 'react-toastify';

export const UsersList: React.FC = () => {
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
  const load = async (p = page, ps = pageSize, q = debouncedQuery, role = roleFilter, status = statusFilter) => {
    setLoading(true);
    try {
      const res = await userService.getUsers(p, ps, q || undefined, role || undefined, status || undefined);
      setUsers(res.items || []);
      setTotal(res.total || 0);
      setPage(res.page || p);
      setPageSize(res.pageSize || ps);
    } catch (e) {
      setUsers([]);
      setTotal(0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1, pageSize, debouncedQuery, roleFilter, statusFilter); }, [debouncedQuery, roleFilter, statusFilter, pageSize]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // When page changes, load specific page
  useEffect(() => { load(page, pageSize, debouncedQuery, roleFilter, statusFilter); }, [page]);

  const handleOpenNew = () => { setEditingUser(null); setShowOnboard(true); };
  const handleEdit = (u: User) => { setEditingUser(u); setShowOnboard(true); };

  const handleDelete = async (u: User) => {
    if (!confirm(`Delete user ${u.name}? This action cannot be undone.`)) return;
    try {
      await userService.deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      toast.success('User deleted');
    } catch (err) {
      console.warn('Failed to delete user', err);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatus = async (u: User) => {
    const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await userService.updateUser(u.id, { status: nextStatus });
      setUsers(prev => prev.map(p => p.id === u.id ? { ...p, status: nextStatus } : p));
      toast.success(`Status updated to ${nextStatus}`);
    } catch (err) {
      console.warn('Failed to update status', err);
      toast.error('Failed to update status');
    }
  };

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const selectAllVisible = () => setSelectedIds(users.map(u=>u.id));
  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
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
  };

  const handleBulkUpdateStatus = async (status: string) => {
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
  };

  // CSV Export
  const exportCSV = (useSelection = true) => {
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
  };

  // Role / Status options (loaded dynamically)
  const [roleOptions, setRoleOptions] = useState<string[]>(['Admin','Editor','Viewer']);
  const [statusOptions, setStatusOptions] = useState<string[]>(['Active','Inactive','Pending']);

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
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-slate-500 text-sm">Manage user accounts, assignments and statuses</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border rounded-md p-2">
            <input
              type="search"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="px-3 py-1 border rounded-md w-64 bg-transparent"
            />

            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="px-2 py-1 border rounded-md bg-transparent">
              <option value="">All Roles</option>
              {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-2 py-1 border rounded-md bg-transparent">
              <option value="">All Statuses</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkUpdateStatus('Active')} className="px-3 py-1 bg-emerald-600 text-white rounded-md">Activate</button>
                <button onClick={() => handleBulkUpdateStatus('Inactive')} className="px-3 py-1 bg-yellow-600 text-white rounded-md">Deactivate</button>
                <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-600 text-white rounded-md">Delete</button>
                <button onClick={() => exportCSV(true)} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded-md">Export Selected</button>
                <button onClick={clearSelection} className="px-3 py-1 border rounded-md">Clear</button>
              </div>
            )}

            <PermissionControl permission="User.Manage">
              <button onClick={handleOpenNew} className="px-3 py-1 bg-indigo-600 text-white rounded-md">New User</button>
            </PermissionControl>

            <button onClick={() => exportCSV(false)} className="px-3 py-1 border rounded-md">Export All</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border p-4">
        {loading ? (
          <div className="h-40 flex items-center justify-center">Loading...</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left">
              <thead className="text-slate-500 text-sm uppercase text-[11px] tracking-widest">
                <tr>
                  <th className="px-2 py-1"><input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === users.length} onChange={(e) => e.target.checked ? selectAllVisible() : clearSelection()} /></th>
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Department / Role</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-2 py-4 text-center text-sm text-slate-500">No users found.</td>
                  </tr>
                )}
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-2 py-2">
                      <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)} />
                    </td>
                    <td className="px-2 py-2">
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-2 py-2">
                      {u.groupName ? (
                        <div className="text-sm">
                          <span className="font-semibold">{u.groupName}</span>
                          {u.roleName && <span className="text-slate-500 ml-2">• {u.roleName}</span>}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">{u.role || '—'}</div>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{u.status}</span>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PermissionControl permission="User.Manage">
                          <button onClick={() => handleEdit(u)} className="px-2 py-1 border rounded-md text-sm">Edit</button>
                          <button onClick={() => handleToggleStatus(u)} className="px-2 py-1 border rounded-md text-sm">{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                          <button onClick={() => handleDelete(u)} className="px-2 py-1 border rounded-md text-sm text-red-600">Delete</button>
                        </PermissionControl>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-slate-500">Showing {total === 0 ? 0 : (Math.min((page-1)*pageSize+1, total))} - {total === 0 ? 0 : Math.min(page*pageSize, total)} of {total} users</div>
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
};

export default UsersList;
