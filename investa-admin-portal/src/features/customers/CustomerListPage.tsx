import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, NotFound, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { EmptyState, OverflowMenuItem, StatusBadge as SharedStatusBadge, TableRowActions, TableSkeleton } from '@/components/common/EnterpriseVisuals';
import { Icon } from '@/components/common/Icons';
import PermissionControl from '@/components/common/PermissionControl';
import { usePermissions } from '@/context/AuthContext';
import { ApiError } from '@/services/api';
import { CUSTOMER_PERMISSIONS, customerService, type CustomerListItem, type CustomerListQuery, type CustomerSortBy, type CustomerStatus, type CustomerType } from './customerService';

const dateLabel = (value: string, language: string) => value ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium' }).format(new Date(value)) : '—';
const errorStatus = (error: unknown) => error instanceof ApiError ? error.status : 0;

export const CustomerListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermissions();
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState<CustomerListQuery>({ page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' });
  const [items, setItems] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(current => ({ ...current, page: 1, search: searchInput.trim() || undefined })), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    void customerService.list(query).then(result => {
      if (!active) return;
      setItems(result.items); setTotal(result.total);
    }).catch(reason => active && setError(reason)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [query, reload]);

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const hasFilters = Boolean(searchInput || query.type || query.status);
  const sort = (sortBy: CustomerSortBy) => setQuery(current => ({ ...current, page: 1, sortBy, sortDirection: current.sortBy === sortBy && current.sortDirection === 'asc' ? 'desc' : 'asc' }));
  const sortLabel = (sortBy: CustomerSortBy) => {
    const label = t(`centralAdmin.customers.columns.${sortBy}`);
    return `${label}${query.sortBy === sortBy ? (query.sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}`;
  };
  const reset = () => { setSearchInput(''); setQuery(current => ({ ...current, page: 1, search: undefined, type: undefined, status: undefined })); };

  const activeFilterCount = [searchInput, query.type, query.status].filter(Boolean).length;
  return <div className="workspace-page">
    <PageHeader eyebrow={t('centralAdmin.eyebrow')} title={t('centralAdmin.customers.title')} description={t('centralAdmin.customers.description')} actions={<PermissionControl permission={CUSTOMER_PERMISSIONS.create}><button type="button" className="btn-primary" onClick={() => navigate('/admin/customers/new')}><Icon name="plus" className="btn-icon" />{t('centralAdmin.customers.actions.new')}</button></PermissionControl>} />
    <section className="enterprise-panel mt-6" aria-label={t('centralAdmin.customers.filtersLabel')}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="min-w-0 flex-1 text-sm font-medium text-foreground">{t('centralAdmin.customers.search')}<span className="relative mt-1 block"><Icon name="search" className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" /><input value={searchInput} onChange={event => setSearchInput(event.target.value)} className="w-full rounded-md border border-border bg-background py-2 ps-9 pe-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder={t('centralAdmin.customers.searchPlaceholder')} aria-label={t('centralAdmin.customers.search')} /></span></label>
        <label className="w-full text-sm font-medium text-foreground sm:w-56">{t('centralAdmin.customers.type')}<select value={query.type || ''} onChange={event => setQuery(current => ({ ...current, page: 1, type: (event.target.value || undefined) as CustomerType | undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"><option value="">{t('centralAdmin.customers.allTypes')}</option><option value="Organization">{t('centralAdmin.customers.types.Organization')}</option><option value="Individual">{t('centralAdmin.customers.types.Individual')}</option></select></label>
        <label className="w-full text-sm font-medium text-foreground sm:w-56">{t('centralAdmin.customers.status')}<select value={query.status || ''} onChange={event => setQuery(current => ({ ...current, page: 1, status: (event.target.value || undefined) as CustomerStatus | undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"><option value="">{t('centralAdmin.customers.allStatuses')}</option><option value="Active">{t('centralAdmin.customers.statuses.Active')}</option><option value="Inactive">{t('centralAdmin.customers.statuses.Inactive')}</option></select></label>
        <button type="button" className="btn-secondary" onClick={reset} disabled={!hasFilters}><Icon name="reset" className="btn-icon" />{t('centralAdmin.customers.actions.reset')}{activeFilterCount > 0 && <span className="filter-count" aria-label={`${activeFilterCount}`}>{activeFilterCount}</span>}</button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t('centralAdmin.customers.filterScope')}</p>
    </section>
    <section className="enterprise-panel mt-4 overflow-hidden" aria-live="polite">
      {loading ? <TableSkeleton label={t('centralAdmin.customers.loading')} /> : errorStatus(error) === 403 ? <AccessDenied title={t('centralAdmin.customers.errors.forbiddenTitle')} description={t('centralAdmin.customers.errors.forbiddenDescription')} /> : errorStatus(error) === 404 ? <NotFound title={t('centralAdmin.customers.errors.notFoundTitle')} description={t('centralAdmin.customers.errors.notFoundDescription')} actionPath="/admin/customers" /> : error ? <div><UnexpectedError title={t('centralAdmin.customers.errors.loadTitle')} description={t('centralAdmin.customers.errors.loadDescription')} /><div className="flex justify-center"><button type="button" className="btn-secondary" onClick={() => setReload(value => value + 1)}><Icon name="reset" className="btn-icon" />{t('centralAdmin.customers.actions.retry')}</button></div></div> : items.length === 0 ? <EmptyState icon="users" title={t('centralAdmin.customers.emptyTitle')} description={t(hasFilters ? 'centralAdmin.customers.emptyFiltered' : 'centralAdmin.customers.emptyDescription')} primaryAction={hasFilters || !hasAnyPermission(CUSTOMER_PERMISSIONS.create) ? undefined : { label: t('centralAdmin.customers.actions.new'), onClick: () => navigate('/admin/customers/new'), icon: 'plus' }} secondaryAction={hasFilters ? { label: t('centralAdmin.customers.actions.reset'), onClick: reset, icon: 'reset' } : undefined} /> : <>
        <div className="admin-table-viewport overflow-x-auto"><table className="admin-data-table min-w-[1050px] w-full" aria-label={t('centralAdmin.customers.tableLabel')}><thead><tr><SortableHeader column="name" label={t('centralAdmin.customers.columns.name')} query={query} onSort={sort} sortLabel={sortLabel} /><SortableHeader column="customerCode" label={t('centralAdmin.customers.columns.customerCode')} query={query} onSort={sort} sortLabel={sortLabel} /><th scope="col" className="text-start">{t('centralAdmin.customers.columns.contact')}</th><th scope="col" className="text-start">{t('centralAdmin.customers.columns.contactDetails')}</th><SortableHeader column="status" label={t('centralAdmin.customers.columns.status')} query={query} onSort={sort} sortLabel={sortLabel} /><SortableHeader column="updatedAt" label={t('centralAdmin.customers.columns.updatedAt')} query={query} onSort={sort} sortLabel={sortLabel} /><th scope="col" className="text-end">{t('centralAdmin.customers.columns.actions')}</th></tr></thead><tbody>{items.map(item => <CustomerRow key={item.id} item={item} language={i18n.language} t={t} />)}</tbody></table></div>
        <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span dir="ltr">{t('centralAdmin.customers.showing', { from: total ? ((query.page - 1) * query.pageSize) + 1 : 0, to: Math.min(query.page * query.pageSize, total), total })}</span><div className="flex items-center gap-3"><label className="flex items-center gap-2">{t('centralAdmin.customers.rows')}<select value={query.pageSize} onChange={event => setQuery(current => ({ ...current, page: 1, pageSize: Number(event.target.value) }))} className="rounded-md border border-border bg-background px-2 py-1 text-foreground"><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label><button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border disabled:opacity-40" onClick={() => setQuery(current => ({ ...current, page: Math.max(1, current.page - 1) }))} disabled={query.page <= 1} aria-label={t('centralAdmin.customers.previous')}>‹</button><span dir="ltr" className="min-w-16 text-center tabular-nums">{query.page} / {pageCount}</span><button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border disabled:opacity-40" onClick={() => setQuery(current => ({ ...current, page: Math.min(pageCount, current.page + 1) }))} disabled={query.page >= pageCount} aria-label={t('centralAdmin.customers.next')}>›</button></div></footer>
      </>}
    </section>
  </div>;
};

const CustomerRow: React.FC<{ item: CustomerListItem; language: string; t: (key: string, options?: Record<string, unknown>) => string }> = ({ item, language, t }) => <tr><td><Link className="font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/admin/customers/${item.id}`}>{item.displayName}</Link><span className="mt-1 block text-xs text-muted-foreground">{item.legalName}</span></td><td><span dir="ltr" className="font-mono text-xs text-muted-foreground">{item.customerCode}</span><span className="mt-1 block text-xs text-muted-foreground">{t(`centralAdmin.customers.types.${item.type}`)}</span></td><td>{item.primaryContactName || '—'}</td><td><div dir="ltr" className="text-sm text-foreground">{item.primaryEmail || '—'}</div><div dir="ltr" className="mt-1 text-xs text-muted-foreground">{item.primaryPhone || '—'}</div></td><td><SharedStatusBadge status={item.status} label={t(`centralAdmin.customers.statuses.${item.status}`)} /></td><td className="text-sm text-muted-foreground">{dateLabel(item.updatedAt, language)}</td><td className="text-end"><TableRowActions openTo={`/admin/customers/${item.id}`} openLabel={t('centralAdmin.customers.actions.view')} overflowLabel={t('centralAdmin.customers.columns.actions')}><OverflowMenuItem to={`/admin/customers/${item.id}`} icon="search">{t('centralAdmin.customers.actions.view')}</OverflowMenuItem><OverflowMenuItem to={`/admin/customers/${item.id}/edit`} icon="edit">{t('centralAdmin.customers.actions.edit')}</OverflowMenuItem></TableRowActions></td></tr>;
const SortableHeader: React.FC<{ column: CustomerSortBy; label: string; query: CustomerListQuery; onSort: (column: CustomerSortBy) => void; sortLabel: (column: CustomerSortBy) => string }> = ({ column, label, query, onSort, sortLabel }) => <th scope="col" className="text-start" aria-sort={query.sortBy === column ? (query.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}><button type="button" className="font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onSort(column)} aria-label={sortLabel(column)}>{label}{query.sortBy === column ? (query.sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}</button></th>;
