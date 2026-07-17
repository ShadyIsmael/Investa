import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PermissionControl from '@/components/common/PermissionControl';
import { RoleUser, roleService } from '@/services/roleService';
import { Group, Permission, RoleWithGroup, User } from '@/types';

const PAGE_SIZE = 10;

const safeError = (error: unknown, fallback: string) =>
  error instanceof Error && error.message && !error.message.includes('[object Object]') ? error.message : fallback;

export const Roles: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [roles, setRoles] = useState<RoleWithGroup[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [page, setPage] = useState(1);
  const [roleUserCounts, setRoleUserCounts] = useState<Record<string, number>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithGroup | null>(null);
  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    groupId: '' as number | '',
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const [detailsRole, setDetailsRole] = useState<RoleWithGroup | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [roleUsers, setRoleUsers] = useState<RoleUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [savingUsers, setSavingUsers] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState(false);

  const refreshRoles = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [roleData, groupData] = await Promise.all([
        roleService.getAllRoles(),
        roleService.getGroups(),
      ]);
      setRoles(roleData);
      setGroups(groupData);
      setRoleUserCounts({});
      void Promise.allSettled(roleData.map(async role => ({
        id: String(role.id),
        count: (await roleService.getRoleUsers(String(role.id))).length,
      }))).then(results => {
        const counts: Record<string, number> = {};
        results.forEach(result => {
          if (result.status === 'fulfilled') counts[result.value.id] = result.value.count;
        });
        setRoleUserCounts(counts);
      });
    } catch (error) {
      setLoadError(safeError(error, t('rolesAdmin.errors.loadRoles')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void refreshRoles(); }, [refreshRoles]);
  useEffect(() => { setPage(1); }, [search, groupFilter, statusFilter]);

  const roleName = useCallback((role: RoleWithGroup) => {
    const primary = i18n.language.startsWith('ar') ? role.nameAr : role.nameEn;
    const fallback = i18n.language.startsWith('ar') ? role.nameEn : role.nameAr;
    return primary?.trim() || fallback?.trim() || '—';
  }, [i18n.language]);

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return roles.filter(role => {
      const matchesSearch = !query || [role.roleCode, role.nameEn, role.nameAr, role.groupName]
        .some(value => String(value ?? '').toLocaleLowerCase().includes(query));
      const matchesStatus = statusFilter === '' || role.isActive === (statusFilter === 'active');
      return matchesSearch && matchesStatus && (groupFilter === '' || role.groupId === groupFilter);
    });
  }, [roles, search, groupFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE));
  const visibleRoles = filteredRoles.slice((Math.min(page, totalPages) - 1) * PAGE_SIZE, Math.min(page, totalPages) * PAGE_SIZE);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', groupId: '', isActive: true });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (role: RoleWithGroup) => {
    setEditingRole(role);
    setForm({
      nameEn: role.nameEn,
      nameAr: role.nameAr,
      descriptionEn: role.descriptionEn ?? '',
      descriptionAr: role.descriptionAr ?? '',
      groupId: role.groupId,
      isActive: role.isActive,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const submitRole = async (event: React.FormEvent) => {
    event.preventDefault();
    const nameEn = form.nameEn.trim();
    const nameAr = form.nameAr.trim();
    if (!nameEn || !nameAr || form.groupId === '') {
      setFormError(t('rolesAdmin.errors.requiredFields'));
      return;
    }

    setSavingRole(true);
    setFormError(null);
    try {
      const payload = {
        nameEn,
        nameAr,
        descriptionEn: form.descriptionEn.trim() || undefined,
        descriptionAr: form.descriptionAr.trim() || undefined,
        groupId: Number(form.groupId),
      };
      if (editingRole) {
        await roleService.updateRole(String(editingRole.id), { ...payload, isActive: form.isActive });
        toast.success(t('rolesAdmin.messages.updated'));
        setFormOpen(false);
      } else {
        const created = await roleService.createRole(payload);
        const createdRole = {
          ...created,
          groupName: created.groupName || groups.find(group => group.id === created.groupId)?.name || '',
        } as RoleWithGroup;
        setEditingRole(createdRole);
        toast.success(t('rolesAdmin.messages.createdWithCode', { code: created.roleCode }));
      }
      await refreshRoles();
    } catch (error) {
      setFormError(safeError(error, t('rolesAdmin.errors.saveRole')));
    } finally {
      setSavingRole(false);
    }
  };

  const deleteRole = async (role: RoleWithGroup) => {
    if (!window.confirm(t('rolesAdmin.confirmDelete', { name: roleName(role) }))) return;
    setDeletingRoleId(String(role.id));
    try {
      await roleService.deleteRole(String(role.id));
      toast.success(t('rolesAdmin.messages.deleted'));
      await refreshRoles();
    } catch (error) {
      toast.error(safeError(error, t('rolesAdmin.errors.deleteRole')));
    } finally {
      setDeletingRoleId(null);
    }
  };

  const loadRoleDetails = useCallback(async (roleId: string) => {
    const [role, permissions, assignedPermissions, users, orgUsers] = await Promise.all([
      roleService.getRoleById(roleId),
      roleService.getAllPermissions(),
      roleService.getRolePermissions(roleId),
      roleService.getRoleUsers(roleId),
      roleService.getOrgUsers(),
    ]);
    setDetailsRole(role);
    setAllPermissions(permissions);
    setSelectedPermissionIds(assignedPermissions.map(permission => Number(permission.id)));
    setRoleUsers(users);
    setRoleUserCounts(current => ({ ...current, [roleId]: users.length }));
    setAvailableUsers(orgUsers);
  }, []);

  const openDetails = async (role: RoleWithGroup) => {
    setDetailsRole(role);
    setDetailsLoading(true);
    setRefreshNotice(false);
    setPermissionSearch('');
    setUserSearch('');
    setSelectedUserIds([]);
    try {
      await loadRoleDetails(String(role.id));
    } catch (error) {
      toast.error(safeError(error, t('rolesAdmin.errors.loadDetails')));
      setDetailsRole(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const permissionLabel = (permission: Permission) => t(
    `rolesAdmin.permissionLabels.${permission.key.replaceAll('.', '_')}`,
    { defaultValue: permission.name || permission.key },
  );

  const groupedPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLocaleLowerCase();
    const groupsMap = new Map<string, Permission[]>();
    allPermissions
      .filter(permission => !query || `${permission.key} ${permission.name ?? ''}`.toLocaleLowerCase().includes(query))
      .forEach(permission => {
        const module = permission.key.split('.')[0] || t('rolesAdmin.otherModule');
        groupsMap.set(module, [...(groupsMap.get(module) ?? []), permission]);
      });
    return [...groupsMap.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions, permissionSearch, t, i18n.language]);

  const savePermissions = async () => {
    if (!detailsRole || !detailsRole.isActive) return;
    setSavingPermissions(true);
    try {
      const ids = [...new Set(selectedPermissionIds)].filter(id => Number.isInteger(id) && id > 0);
      await roleService.assignPermissions(String(detailsRole.id), { permissionIds: ids });
      await loadRoleDetails(String(detailsRole.id));
      setRefreshNotice(true);
      toast.success(t('rolesAdmin.messages.permissionsSaved'));
    } catch (error) {
      toast.error(safeError(error, t('rolesAdmin.errors.savePermissions')));
    } finally {
      setSavingPermissions(false);
    }
  };

  const assignedIds = useMemo(() => new Set(roleUsers.map(user => user.id)), [roleUsers]);
  const matchingAvailableUsers = useMemo(() => {
    const query = userSearch.trim().toLocaleLowerCase();
    return availableUsers.filter(user => !assignedIds.has(user.id) && (!query || `${user.name ?? ''} ${user.email ?? ''}`.toLocaleLowerCase().includes(query)));
  }, [availableUsers, assignedIds, userSearch]);

  const assignUsers = async () => {
    if (!detailsRole || !detailsRole.isActive || selectedUserIds.length === 0) return;
    setSavingUsers(true);
    try {
      await roleService.assignUsers(String(detailsRole.id), { userIds: selectedUserIds });
      await loadRoleDetails(String(detailsRole.id));
      setSelectedUserIds([]);
      setRefreshNotice(true);
      toast.success(t('rolesAdmin.messages.usersAssigned'));
    } catch (error) {
      toast.error(safeError(error, t('rolesAdmin.errors.assignUsers')));
    } finally {
      setSavingUsers(false);
    }
  };

  const removeUser = async (user: RoleUser) => {
    if (!detailsRole || !window.confirm(t('rolesAdmin.confirmRemoveUser', { name: user.name || user.email || t('rolesAdmin.user') }))) return;
    setSavingUsers(true);
    try {
      await roleService.removeUserFromRole(String(detailsRole.id), user.id);
      await loadRoleDetails(String(detailsRole.id));
      setRefreshNotice(true);
      toast.success(t('rolesAdmin.messages.userRemoved'));
    } catch (error) {
      toast.error(safeError(error, t('rolesAdmin.errors.removeUser')));
    } finally {
      setSavingUsers(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4" dir={i18n.dir()}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text">{t('pages.rolesManagement')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('pages.rolesManagementDescription')}</p>
        </div>
        <PermissionControl permission="Role.Manage">
          <button onClick={openCreate} className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            {t('rolesAdmin.createRole')}
          </button>
        </PermissionControl>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-3 md:grid-cols-[minmax(0,1fr)_220px_180px]">
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('rolesAdmin.searchRoles')} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-text outline-none focus:border-primary" />
        <select value={groupFilter} onChange={event => setGroupFilter(event.target.value ? Number(event.target.value) : '')} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-text">
          <option value="">{t('rolesAdmin.allGroups')}</option>
          {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
        </select>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'active' | 'inactive' | '')} className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-text">
          <option value="">{t('rolesAdmin.allStatuses')}</option>
          <option value="active">{t('rolesAdmin.active')}</option>
          <option value="inactive">{t('rolesAdmin.inactive')}</option>
        </select>
      </div>

      <div className="flex min-h-[480px] flex-col overflow-hidden rounded-xl border border-border bg-surface">
        <div className="min-h-0 flex-1 overflow-auto">
          {loading ? <div className="grid min-h-[390px] place-items-center text-sm text-muted-foreground">{t('rolesAdmin.loading')}</div>
            : loadError ? <div className="grid min-h-[390px] place-items-center p-6 text-center"><div><p className="text-sm text-danger">{loadError}</p><button onClick={() => void refreshRoles()} className="mt-3 rounded-lg border border-border px-3 py-2 text-sm text-text">{t('rolesAdmin.retry')}</button></div></div>
            : visibleRoles.length === 0 ? <div className="grid min-h-[390px] place-items-center text-sm text-muted-foreground">{t('rolesAdmin.noRoles')}</div>
            : <table className="w-full min-w-[780px] text-sm">
              <thead className="sticky top-0 z-10 bg-muted/90 text-xs uppercase text-muted-foreground backdrop-blur">
                <tr>{['roleCode', 'roleName', 'group', 'status', 'assignedUsersCount', 'actions'].map(key => <th key={key} className="px-4 py-3 text-start font-semibold">{t(`rolesAdmin.${key}`)}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleRoles.map(role => <tr key={role.id} className="h-14 hover:bg-muted/40">
                  <td className="px-4 font-mono text-xs text-muted-foreground">{role.roleCode || '—'}</td>
                  <td className="px-4 font-semibold text-text"><span className="block max-w-[240px] truncate" title={roleName(role)}>{roleName(role)}</span></td>
                  <td className="px-4 text-muted-foreground">{role.groupName || '—'}</td>
                  <td className="px-4"><span className={role.isActive ? 'rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success' : 'rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground'}>{t(role.isActive ? 'rolesAdmin.active' : 'rolesAdmin.inactive')}</span></td>
                  <td className="px-4 text-muted-foreground tabular-nums">{roleUserCounts[String(role.id)] ?? '—'}</td>
                  <td className="px-4"><div className="flex items-center gap-3">
                    <button onClick={() => void openDetails(role)} className="font-medium text-primary">{t('rolesAdmin.view')}</button>
                    <PermissionControl permission="Role.Manage"><button onClick={() => openEdit(role)} className="font-medium text-text">{t('rolesAdmin.edit')}</button></PermissionControl>
                    <PermissionControl permission="Role.Manage"><button disabled={deletingRoleId === String(role.id)} onClick={() => void deleteRole(role)} className="font-medium text-danger disabled:opacity-50">{t('rolesAdmin.deactivate')}</button></PermissionControl>
                  </div></td>
                </tr>)}
              </tbody>
            </table>}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>{t('rolesAdmin.results', { count: filteredRoles.length })}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))} className="rounded border border-border px-3 py-1.5 disabled:opacity-40">{t('rolesAdmin.previous')}</button>
            <span className="tabular-nums">{Math.min(page, totalPages)} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))} className="rounded border border-border px-3 py-1.5 disabled:opacity-40">{t('rolesAdmin.next')}</button>
          </div>
        </div>
      </div>

      {formOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setFormOpen(false); }}>
        <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-5 shadow-2xl">
          <h2 className="text-lg font-bold text-text">{editingRole ? t('rolesAdmin.editRole') : t('rolesAdmin.createRole')}</h2>
          <form onSubmit={submitRole} className="mt-4 space-y-4">
            {editingRole && <label className="block text-sm font-medium text-text">{t('rolesAdmin.roleCode')}<input value={editingRole.roleCode || ''} readOnly className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 font-mono text-xs text-muted-foreground" /></label>}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-text">{t('rolesAdmin.nameEn')} *<input autoFocus value={form.nameEn} onChange={event => setForm({ ...form, nameEn: event.target.value })} dir="ltr" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-text" /></label>
              <label className="block text-sm font-medium text-text">{t('rolesAdmin.nameAr')} *<input value={form.nameAr} onChange={event => setForm({ ...form, nameAr: event.target.value })} dir="rtl" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-text" /></label>
            </div>
            <label className="block text-sm font-medium text-text">{t('rolesAdmin.group')} *<select value={form.groupId} onChange={event => setForm({ ...form, groupId: event.target.value ? Number(event.target.value) : '' })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-text"><option value="">{t('rolesAdmin.selectGroup')}</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-text">{t('rolesAdmin.descriptionEn')}<textarea value={form.descriptionEn} onChange={event => setForm({ ...form, descriptionEn: event.target.value })} rows={3} dir="ltr" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-text" /></label>
              <label className="block text-sm font-medium text-text">{t('rolesAdmin.descriptionAr')}<textarea value={form.descriptionAr} onChange={event => setForm({ ...form, descriptionAr: event.target.value })} rows={3} dir="rtl" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-text" /></label>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-text"><input type="checkbox" checked={form.isActive} disabled={!editingRole} onChange={event => setForm({ ...form, isActive: event.target.checked })} />{t('rolesAdmin.activeStatus')}</label>
            {formError && <p className="text-sm text-danger">{formError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm text-text">{t('rolesAdmin.cancel')}</button><button disabled={savingRole} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingRole ? t('rolesAdmin.saving') : t('rolesAdmin.save')}</button></div>
          </form>
        </div>
      </div>}

      {detailsRole && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 md:p-8" onMouseDown={event => { if (event.target === event.currentTarget) setDetailsRole(null); }}>
        <div className="mx-auto w-full max-w-5xl rounded-xl border border-border bg-surface p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4"><div><h2 className="text-lg font-bold text-text">{roleName(detailsRole)}</h2><p className="text-sm text-muted-foreground">{detailsRole.groupName || '—'} · <span className="font-mono text-xs">{detailsRole.roleCode || '—'}</span></p></div><button onClick={() => setDetailsRole(null)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-text">{t('rolesAdmin.close')}</button></div>
          {refreshNotice && <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-text">{t('rolesAdmin.permissionRefreshNotice')}</div>}
          {!detailsRole.isActive && <div className="mt-4 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{t('rolesAdmin.inactiveRoleExplanation')}</div>}
          {detailsLoading ? <div className="grid min-h-[360px] place-items-center text-sm text-muted-foreground">{t('rolesAdmin.loadingDetails')}</div> : <>
          <dl className="mt-5 grid gap-3 rounded-lg border border-border bg-background p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-xs text-muted-foreground">{t('rolesAdmin.roleCode')}</dt><dd className="mt-1 font-mono text-text">{detailsRole.roleCode || '—'}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('rolesAdmin.group')}</dt><dd className="mt-1 text-text">{detailsRole.groupName || '—'}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('rolesAdmin.status')}</dt><dd className="mt-1 text-text">{t(detailsRole.isActive ? 'rolesAdmin.active' : 'rolesAdmin.inactive')}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('rolesAdmin.nameEn')}</dt><dd className="mt-1 text-text" dir="ltr">{detailsRole.nameEn || '—'}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('rolesAdmin.nameAr')}</dt><dd className="mt-1 text-text" dir="rtl">{detailsRole.nameAr || '—'}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('rolesAdmin.descriptionEn')}</dt><dd className="mt-1 text-text" dir="ltr">{detailsRole.descriptionEn || '—'}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{t('rolesAdmin.descriptionAr')}</dt><dd className="mt-1 text-text" dir="rtl">{detailsRole.descriptionAr || '—'}</dd></div>
          </dl>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <section><div className="flex items-center justify-between"><h3 className="font-semibold text-text">{t('rolesAdmin.permissions')}</h3><span className="text-xs text-muted-foreground">{selectedPermissionIds.length}</span></div>
              <input value={permissionSearch} onChange={event => setPermissionSearch(event.target.value)} placeholder={t('rolesAdmin.searchPermissions')} className="mt-3 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-text" />
              <div className="mt-3 h-[390px] overflow-y-auto rounded-lg border border-border p-3">
                {groupedPermissions.length === 0 ? <p className="text-sm text-muted-foreground">{t('rolesAdmin.noPermissions')}</p> : groupedPermissions.map(([module, permissions]) => <div key={module} className="mb-4 last:mb-0"><h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t(`rolesAdmin.modules.${module}`, { defaultValue: module })}</h4><div className="space-y-1">{permissions.map(permission => <label key={permission.id} className="flex items-start gap-2 rounded-lg p-2 hover:bg-muted/50"><input type="checkbox" disabled={!detailsRole.isActive} checked={selectedPermissionIds.includes(Number(permission.id))} onChange={() => setSelectedPermissionIds(ids => ids.includes(Number(permission.id)) ? ids.filter(id => id !== Number(permission.id)) : [...ids, Number(permission.id)])} className="mt-1" /><span className="min-w-0"><span className="block text-sm font-medium text-text">{permissionLabel(permission)}</span><span className="block font-mono text-xs text-muted-foreground">{permission.key}</span></span></label>)}</div></div>)}
              </div>
              <PermissionControl permission="Role.Manage"><button disabled={savingPermissions || !detailsRole.isActive} onClick={() => void savePermissions()} className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingPermissions ? t('rolesAdmin.saving') : t('rolesAdmin.savePermissions')}</button></PermissionControl>
            </section>
            <section><div className="flex items-center justify-between"><h3 className="font-semibold text-text">{t('rolesAdmin.assignedUsers')}</h3><span className="text-xs text-muted-foreground">{roleUsers.length}</span></div>
              <div className="mt-3 max-h-44 overflow-y-auto rounded-lg border border-border"><div className="divide-y divide-border">{roleUsers.length === 0 ? <p className="p-3 text-sm text-muted-foreground">{t('rolesAdmin.noAssignedUsers')}</p> : roleUsers.map(user => <div key={user.id} className="flex items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-text">{user.name || user.email || '—'}</p><p className="truncate text-xs text-muted-foreground">{user.email || '—'}</p></div><PermissionControl permission="Role.Manage"><button disabled={savingUsers} onClick={() => void removeUser(user)} className="text-xs font-medium text-danger disabled:opacity-50">{t('rolesAdmin.remove')}</button></PermissionControl></div>)}</div></div>
              <h4 className="mt-5 text-sm font-semibold text-text">{t('rolesAdmin.addUsers')}</h4><input disabled={!detailsRole.isActive} value={userSearch} onChange={event => setUserSearch(event.target.value)} placeholder={t('rolesAdmin.searchOrgUsers')} className="mt-3 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-text disabled:bg-muted disabled:opacity-60" />
              <div className="mt-3 h-52 overflow-y-auto rounded-lg border border-border p-2">{matchingAvailableUsers.length === 0 ? <p className="p-2 text-sm text-muted-foreground">{t('rolesAdmin.noAvailableUsers')}</p> : matchingAvailableUsers.map(user => <label key={user.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-muted/50"><input type="checkbox" disabled={!detailsRole.isActive} checked={selectedUserIds.includes(user.id)} onChange={() => setSelectedUserIds(ids => ids.includes(user.id) ? ids.filter(id => id !== user.id) : [...ids, user.id])} /><span className="min-w-0"><span className="block truncate text-sm font-medium text-text">{user.name || user.email || '—'}</span><span className="block truncate text-xs text-muted-foreground">{user.email || '—'}</span></span></label>)}</div>
              <PermissionControl permission="Role.Manage"><button disabled={savingUsers || !detailsRole.isActive || selectedUserIds.length === 0} onClick={() => void assignUsers()} className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingUsers ? t('rolesAdmin.saving') : t('rolesAdmin.assignSelected')}</button></PermissionControl>
            </section>
          </div></>}
        </div>
      </div>}
    </div>
  );
};
