import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { EmptyState, OverflowMenuItem, StatusBadge as SharedStatusBadge, TableRowActions, TableSkeleton } from '@/components/common/EnterpriseVisuals';
import { Icon } from '@/components/common/Icons';
import { ApiError } from '@/services/api';
import { contractService, CONTRACT_PERMISSIONS, type ContractListItem, type ContractListQuery, type ContractSortBy, type ContractStatus } from './contractService';

const statuses: ContractStatus[] = ['Draft', 'Active', 'Completed', 'Terminated'];
const dateLabel = (value: string | null | undefined, language: string) => value ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium' }).format(new Date(`${value.slice(0, 10)}T00:00:00`)) : '—';
const money = (value: number, currency: string, language: string) => `${value.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
const hasContractFilters = (searchInput: string, query: ContractListQuery): boolean => Boolean(searchInput || query.status || query.customerId || query.currency || query.startDateFrom || query.startDateTo);

export const ContractListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState<ContractListQuery>({ page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' });
  const [searchInput, setSearchInput] = useState('');
  const [items, setItems] = useState<ContractListItem[]>([]);
  const [customers, setCustomers] = useState<{ id: string; customerCode: string; displayName: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => { void contractService.customers().then(setCustomers).catch(() => undefined); }, []);
  useEffect(() => { const timer = window.setTimeout(() => setQuery(current => ({ ...current, page: 1, search: searchInput.trim() || undefined })), 250); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => { let active = true; setLoading(true); void contractService.list(query).then(result => { if (!active) return; setItems(result.items); setTotal(result.total); setError(null); }).catch(reason => active && setError(reason)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [query]);

  const sort = (sortBy: ContractSortBy) => setQuery(current => ({ ...current, page: 1, sortBy, sortDirection: current.sortBy === sortBy && current.sortDirection === 'asc' ? 'desc' : 'asc' }));
  const reset = () => { setSearchInput(''); setQuery({ page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' }); };
  const pages = Math.max(1, Math.ceil(total / query.pageSize));
  const statusCode = error instanceof ApiError ? error.status : 0;
  if (statusCode === 403) return <AccessDenied title={t('centralAdmin.contracts.errors.forbiddenTitle')} description={t('centralAdmin.contracts.errors.forbiddenDescription')} />;
  if (error && !loading) return <UnexpectedError title={t('centralAdmin.contracts.errors.loadTitle')} description={t('centralAdmin.contracts.errors.loadDescription')} />;

  const hasFilters = hasContractFilters(searchInput, query);
  return <div className="workspace-page">
    <PageHeader eyebrow={t('centralAdmin.contracts.eyebrow')} title={t('centralAdmin.contracts.title')} description={t('centralAdmin.contracts.description')} />
    <section className="enterprise-panel mt-6" aria-label={t('centralAdmin.contracts.filtersLabel')}>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm font-medium text-foreground lg:col-span-2">{t('centralAdmin.contracts.search')}<input aria-label={t('centralAdmin.contracts.search')} value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder={t('centralAdmin.contracts.searchPlaceholder')} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.contracts.status')}<select aria-label={t('centralAdmin.contracts.status')} value={query.status || ''} onChange={event => setQuery(current => ({ ...current, page: 1, status: (event.target.value || undefined) as ContractStatus | undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">{t('centralAdmin.contracts.allStatuses')}</option>{statuses.map(status => <option key={status} value={status}>{t(`centralAdmin.contracts.statuses.${status}`)}</option>)}</select></label>
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.contracts.customer')}<select aria-label={t('centralAdmin.contracts.customer')} value={query.customerId || ''} onChange={event => setQuery(current => ({ ...current, page: 1, customerId: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">{t('centralAdmin.contracts.allCustomers')}</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.customerCode} — {customer.displayName}</option>)}</select></label>
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.contracts.currency')}<input aria-label={t('centralAdmin.contracts.currency')} value={query.currency || ''} onChange={event => setQuery(current => ({ ...current, page: 1, currency: event.target.value.toUpperCase() || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" maxLength={3} /></label>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.contracts.startDateFrom')}<input type="date" value={query.startDateFrom || ''} onChange={event => setQuery(current => ({ ...current, page: 1, startDateFrom: event.target.value || undefined }))} className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" dir="ltr" /></label>
        <label className="text-sm font-medium text-foreground">{t('centralAdmin.contracts.startDateTo')}<input type="date" value={query.startDateTo || ''} onChange={event => setQuery(current => ({ ...current, page: 1, startDateTo: event.target.value || undefined }))} className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm" dir="ltr" /></label>
        <button type="button" className="btn-secondary" onClick={reset} disabled={!hasFilters}><Icon name="reset" className="btn-icon" />{t('centralAdmin.contracts.clearFilters')}{hasFilters && <span className="filter-count" aria-hidden="true">•</span>}</button>
      </div>
    </section>
    <section className="enterprise-panel mt-5 overflow-hidden p-0">
      <div className="admin-table-viewport overflow-x-auto"><table className="admin-data-table min-w-[1000px] w-full"><thead><tr><SortableHeader label={t('centralAdmin.contracts.contractNumber')} sortBy="contractNumber" query={query} onSort={sort} /><SortableHeader label={t('centralAdmin.contracts.customer')} sortBy="customer" query={query} onSort={sort} /><th className="text-start">{t('centralAdmin.contracts.sourceQuotation')}</th><th className="text-end"><span className="sr-only">{t('centralAdmin.contracts.title')}</span></th><SortableHeader label={t('centralAdmin.contracts.status')} sortBy="status" query={query} onSort={sort} /><SortableHeader label={t('centralAdmin.contracts.startDate')} sortBy="startDate" query={query} onSort={sort} /><SortableHeader label={t('centralAdmin.contracts.value')} sortBy="grandTotal" query={query} onSort={sort} /></tr></thead><tbody>{loading ? <tr><td colSpan={7}><TableSkeleton label={t('centralAdmin.contracts.loading')} /></td></tr> : items.length === 0 ? <tr><td colSpan={7}><EmptyState icon="file" title={t('centralAdmin.contracts.empty')} secondaryAction={hasFilters ? { label: t('centralAdmin.contracts.clearFilters'), onClick: reset, icon: 'reset' } : undefined} /></td></tr> : items.map(item => <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30"><td className="px-4 py-3"><Link className="font-semibold text-primary hover:underline" to={`/admin/sales/contracts/${item.id}`}>{item.contractNumber}</Link></td><td className="px-4 py-3"><Link className="font-medium text-primary hover:underline" to={`/admin/customers/${item.customerId}`}>{item.customerName}</Link><span className="mt-1 block font-mono text-xs text-muted-foreground" dir="ltr">{item.customerCode}</span></td><td className="px-4 py-3"><Link className="text-primary hover:underline" to={`/admin/sales/quotations/${item.sourceQuotationId}`}>{item.sourceQuotationNumber}</Link>{item.salesOpportunityCode && <span className="mt-1 block text-xs text-muted-foreground">{item.salesOpportunityCode}</span>}</td><td><SharedStatusBadge status={item.status} label={t(`centralAdmin.contracts.statuses.${item.status}`)} /></td><td className="px-4 py-3" dir="ltr">{dateLabel(item.startDate, i18n.language)}</td><td className="cell-money" dir="ltr">{money(item.grandTotal, item.currency, i18n.language)}</td><td className="text-end"><TableRowActions openTo={`/admin/sales/contracts/${item.id}`} openLabel={t('common.viewDetails')} overflowLabel={t('common.actions')}><OverflowMenuItem to={`/admin/sales/contracts/${item.id}`} icon="search">{t('common.viewDetails')}</OverflowMenuItem><OverflowMenuItem to={`/admin/sales/quotations/${item.sourceQuotationId}`} icon="file">{t('centralAdmin.contracts.sourceQuotation')}</OverflowMenuItem></TableRowActions></td></tr>)}</tbody></table></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground"><span>{t('centralAdmin.contracts.results', { count: total })}</span><div className="flex items-center gap-2"><button type="button" className="btn-secondary" disabled={query.page <= 1} onClick={() => setQuery(current => ({ ...current, page: current.page - 1 }))}>{t('centralAdmin.contracts.previous')}</button><span dir="ltr">{query.page} / {pages}</span><button type="button" className="btn-secondary" disabled={query.page >= pages} onClick={() => setQuery(current => ({ ...current, page: current.page + 1 }))}>{t('centralAdmin.contracts.next')}</button></div></div>
    </section>
    <span className="sr-only">{CONTRACT_PERMISSIONS.view}</span>
  </div>;
};

const SortableHeader: React.FC<{ label: string; sortBy: ContractSortBy; query: ContractListQuery; onSort: (sortBy: ContractSortBy) => void }> = ({ label, sortBy, query, onSort }) => <th className="text-start"><button type="button" className="font-semibold hover:text-foreground" onClick={() => onSort(sortBy)}>{label}{query.sortBy === sortBy ? <span aria-hidden="true"> {query.sortDirection === 'asc' ? '↑' : '↓'}</span> : null}</button></th>;
