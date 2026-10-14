import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { EmptyState, OverflowMenuItem, SemanticBadge, StatusBadge as SharedStatusBadge, TableRowActions, TableSkeleton } from '@/components/common/EnterpriseVisuals';
import { Icon } from '@/components/common/Icons';
import PermissionControl from '@/components/common/PermissionControl';
import { ApiError } from '@/services/api';
import { QUOTATION_PERMISSIONS, quotationService, type QuotationCustomerLookup, type QuotationListItem, type QuotationListQuery, type QuotationSortBy, type QuotationStatus } from './quotationService';

const statuses: QuotationStatus[] = ['Draft', 'Sent', 'Accepted', 'Rejected'];
const dateLabel = (value: string | null | undefined, language: string) => value ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium' }).format(new Date(value)) : '—';
const money = (value: number, currency: string, language: string) => `${value.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

export const QuotationListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState<QuotationListQuery>({ page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [items, setItems] = useState<QuotationListItem[]>([]);
  const [customers, setCustomers] = useState<QuotationCustomerLookup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => { void quotationService.customers().then(setCustomers).catch(() => undefined); }, []);
  useEffect(() => { const timer = window.setTimeout(() => setQuery(current => ({ ...current, page: 1, search: searchInput.trim() || undefined })), 250); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => { let active = true; setLoading(true); void quotationService.list(query).then(result => { if (!active) return; setItems(result.items); setTotal(result.total); setError(null); }).catch(reason => active && setError(reason)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [query]);

  const sort = (sortBy: QuotationSortBy) => setQuery(current => ({ ...current, page: 1, sortBy, sortDirection: current.sortBy === sortBy && current.sortDirection === 'asc' ? 'desc' : 'asc' }));
  const reset = () => { setSearchInput(''); setQuery({ page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' }); };
  const hasFilters = Boolean(searchInput || query.status || query.customerId || query.issueDateFrom || query.issueDateTo);
  const pages = Math.max(1, Math.ceil(total / query.pageSize));
  const statusCode = error instanceof ApiError ? error.status : 0;
  if (statusCode === 403) return <AccessDenied title={t('centralAdmin.quotations.errors.forbiddenTitle')} description={t('centralAdmin.quotations.errors.forbiddenDescription')} />;
  if (error && !loading) return <UnexpectedError title={t('centralAdmin.quotations.errors.loadTitle')} description={t('centralAdmin.quotations.errors.loadDescription')} />;

  const activeFilterCount = [searchInput, query.status, query.customerId, query.issueDateFrom, query.issueDateTo].filter(Boolean).length;
  return <div className="workspace-page">
    <PageHeader eyebrow={t('centralAdmin.quotations.eyebrow')} title={t('centralAdmin.quotations.title')} description={t('centralAdmin.quotations.description')} actions={<PermissionControl permission={QUOTATION_PERMISSIONS.create}><button type="button" className="btn-primary" onClick={() => navigate('/admin/sales/quotations/new')}><Icon name="plus" className="btn-icon" />{t('centralAdmin.quotations.actions.new')}</button></PermissionControl>} />
    <section className="enterprise-panel mt-6" aria-label={t('centralAdmin.quotations.filtersLabel')}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm font-medium text-foreground lg:col-span-2">{t('centralAdmin.quotations.search')}<input aria-label={t('centralAdmin.quotations.search')} value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder={t('centralAdmin.quotations.searchPlaceholder')} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.quotations.status')}<select aria-label={t('centralAdmin.quotations.status')} value={query.status || ''} onChange={event => setQuery(current => ({ ...current, page: 1, status: (event.target.value || undefined) as QuotationStatus | undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">{t('centralAdmin.quotations.allStatuses')}</option>{statuses.map(status => <option key={status} value={status}>{t(`centralAdmin.quotations.statuses.${status}`)}</option>)}</select></label>
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.quotations.customer')}<select aria-label={t('centralAdmin.quotations.customer')} value={query.customerId || ''} onChange={event => setQuery(current => ({ ...current, page: 1, customerId: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">{t('centralAdmin.quotations.allCustomers')}</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.customerCode} — {customer.displayName}</option>)}</select></label>
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.quotations.issueDateFrom')}<input aria-label={t('centralAdmin.quotations.issueDateFrom')} type="date" value={query.issueDateFrom || ''} onChange={event => setQuery(current => ({ ...current, page: 1, issueDateFrom: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" dir="ltr" /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{t('centralAdmin.quotations.filterScope')}</p><button type="button" className="btn-secondary" onClick={reset} disabled={!hasFilters}><Icon name="reset" className="btn-icon" />{t('centralAdmin.quotations.actions.reset')}{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</button></div>
    </section>
    <section className="enterprise-panel mt-5 overflow-hidden" aria-busy={loading}>
      {loading ? <TableSkeleton label={t('centralAdmin.quotations.loading')} rows={4} /> : items.length === 0 ? <EmptyState icon="file" title={t('centralAdmin.quotations.emptyTitle')} description={t(hasFilters ? 'centralAdmin.quotations.emptyFiltered' : 'centralAdmin.quotations.emptyDescription')} primaryAction={hasFilters ? undefined : { label: t('centralAdmin.quotations.actions.new'), onClick: () => navigate('/admin/sales/quotations/new'), icon: 'plus' }} secondaryAction={hasFilters ? { label: t('centralAdmin.quotations.actions.reset'), onClick: reset, icon: 'reset' } : undefined} /> : <div className="admin-table-viewport overflow-x-auto"><table className="admin-data-table min-w-[1050px] w-full"><thead><tr><SortableHeader column="quotationNumber" label={t('centralAdmin.quotations.table.number')} query={query} onSort={sort} /><SortableHeader column="customer" label={t('centralAdmin.quotations.table.customer')} query={query} onSort={sort} /><SortableHeader column="status" label={t('centralAdmin.quotations.table.status')} query={query} onSort={sort} /><SortableHeader column="issueDate" label={t('centralAdmin.quotations.table.issueDate')} query={query} onSort={sort} /><SortableHeader column="validUntil" label={t('centralAdmin.quotations.table.validUntil')} query={query} onSort={sort} /><SortableHeader column="grandTotal" label={t('centralAdmin.quotations.table.total')} query={query} onSort={sort} /><th className="text-end" scope="col">{t('centralAdmin.quotations.table.actions')}</th></tr></thead><tbody>{items.map(item => <QuotationRow key={item.id} item={item} language={i18n.language} t={t} />)}</tbody></table></div>}
      {items.length > 0 && <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-3 text-sm"><span className="text-muted-foreground">{t('centralAdmin.quotations.pagination', { page: query.page, pages, total })}</span><div className="flex gap-2"><button type="button" className="btn-secondary" disabled={query.page <= 1} onClick={() => setQuery(current => ({ ...current, page: current.page - 1 }))}>{t('centralAdmin.quotations.actions.previous')}</button><button type="button" className="btn-secondary" disabled={query.page >= pages} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}>{t('centralAdmin.quotations.actions.next')}</button></div></div>}
    </section>
  </div>;
};

const SortableHeader: React.FC<{ column: QuotationSortBy; label: string; query: QuotationListQuery; onSort: (column: QuotationSortBy) => void }> = ({ column, label, query, onSort }) => <th scope="col" className="px-3 py-3 text-start"><button type="button" className="font-semibold hover:text-primary" onClick={() => onSort(column)}>{label}{query.sortBy === column ? (query.sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}</button></th>;
const QuotationRow: React.FC<{ item: QuotationListItem; language: string; t: (key: string, options?: Record<string, unknown>) => string }> = ({ item, language, t }) => <tr><td><Link className="font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/admin/sales/quotations/${item.id}`}>{item.quotationNumber}</Link><span className="mt-1 block text-xs text-muted-foreground">{item.salesOpportunityCode || t('centralAdmin.quotations.table.direct')}</span></td><td><Link className="hover:text-primary" to={`/admin/customers/${item.customerId}`}>{item.customerName}</Link><span className="mt-1 block font-mono text-xs text-muted-foreground" dir="ltr">{item.customerCode}</span></td><td><SharedStatusBadge status={item.status} label={t(`centralAdmin.quotations.statuses.${item.status}`)} />{item.isExpired && <SemanticBadge tone="warning" icon="clock"><span className="ms-1">{t('centralAdmin.quotations.expired')}</span></SemanticBadge>}</td><td dir="ltr">{dateLabel(item.issueDate, language)}</td><td dir="ltr">{dateLabel(item.validUntil, language)}</td><td className="cell-money">{money(item.grandTotal, item.currency, language)}</td><td className="text-end"><TableRowActions openTo={`/admin/sales/quotations/${item.id}`} openLabel={t('centralAdmin.quotations.actions.view')} overflowLabel={t('centralAdmin.quotations.table.actions')}><OverflowMenuItem to={`/admin/sales/quotations/${item.id}`} icon="search">{t('centralAdmin.quotations.actions.view')}</OverflowMenuItem><OverflowMenuItem to={`/admin/sales/quotations/${item.id}/edit`} icon="edit">{t('centralAdmin.quotations.actions.edit')}</OverflowMenuItem></TableRowActions></td></tr>;
