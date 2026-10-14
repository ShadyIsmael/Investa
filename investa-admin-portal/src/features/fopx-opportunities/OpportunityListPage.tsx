import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccessDenied, NotFound, PageHeader, UnexpectedError } from '@/components/common/EnterpriseStates';
import { EmptyState, OverflowMenuItem, StatusBadge as SharedStatusBadge, TableRowActions, TableSkeleton } from '@/components/common/EnterpriseVisuals';
import { Icon } from '@/components/common/Icons';
import { ApiError } from '@/services/api';
import { opportunityAdminService, OPPORTUNITY_FUNDING_STATUSES, OPPORTUNITY_MODERATION_STATUSES, OPPORTUNITY_STATUSES, type OpportunityFundingStatus, type OpportunityListItem, type OpportunityListQuery, type OpportunityModerationStatus, type OpportunityStatus } from './opportunityAdminService';

type SortBy = OpportunityListQuery['sortBy'];

const dateLabel = (value: string, language: string): string => value
  ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle: 'medium' }).format(new Date(value))
  : '—';

const amountLabel = (value: number, language: string): string => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
  maximumFractionDigits: 2,
}).format(value);

const numericFilterValue = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const apiStatus = (error: unknown): number => error instanceof ApiError ? error.status : 0;

const labelFor = (t: (key: string, options?: Record<string, unknown>) => string, group: string, value: string): string =>
  t(`centralAdmin.opportunities.${group}.${value}`, { defaultValue: value });

const StatusText: React.FC<{ value: string; group: 'lifecycle' | 'moderation' | 'funding'; t: (key: string, options?: Record<string, unknown>) => string }> = ({ value, group, t }) => (
  <SharedStatusBadge status={value} label={labelFor(t, group, value)} />
);

const OpportunityError: React.FC<{ error: unknown; onRetry: () => void }> = ({ error, onRetry }) => {
  const { t } = useTranslation();
  const status = apiStatus(error);
  if (status === 403) return <AccessDenied title={t('centralAdmin.opportunities.errors.forbiddenTitle')} description={t('centralAdmin.opportunities.errors.forbiddenDescription')} />;
  if (status === 404) return <NotFound title={t('centralAdmin.opportunities.errors.notFoundTitle')} description={t('centralAdmin.opportunities.errors.notFoundDescription')} actionPath="/admin/fopx/opportunities" />;
  return <div><UnexpectedError title={t('centralAdmin.opportunities.errors.loadTitle')} description={t('centralAdmin.opportunities.errors.loadDescription')} /><div className="flex justify-center"><button type="button" className="btn-secondary" onClick={onRetry}><Icon name="reset" className="btn-icon" />{t('centralAdmin.opportunities.actions.retry')}</button></div></div>;
};

export const OpportunityListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState<OpportunityListQuery>({ page: 1, pageSize: 20, sortBy: 'createdAt', sortDirection: 'desc' });
  const [rows, setRows] = useState<OpportunityListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(current => ({ ...current, page: 1, search: searchInput.trim() || undefined }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void opportunityAdminService.list(query).then(result => {
      if (!active) return;
      setRows(result.items);
      setTotal(result.total);
    }).catch(reason => {
      if (active) setError(reason);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [query, reloadToken]);

  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const sortLabel = useMemo(() => (sortBy: SortBy) => {
    const active = query.sortBy === sortBy;
    return `${labelFor(t, 'columns', sortBy)}${active ? (query.sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}`;
  }, [query.sortBy, query.sortDirection, t]);

  const sort = (sortBy: SortBy) => setQuery(current => ({
    ...current,
    page: 1,
    sortBy,
    sortDirection: current.sortBy === sortBy && current.sortDirection === 'asc' ? 'desc' : 'asc',
  }));

  const resetFilters = () => {
    setSearchInput('');
    setQuery(current => ({ ...current, page: 1, search: undefined, status: undefined, moderationStatus: undefined, fundingStatus: undefined, projectId: undefined, founderId: undefined, createdFrom: undefined, createdTo: undefined, updatedFrom: undefined, updatedTo: undefined }));
  };

  const hasFilters = Boolean(searchInput || query.status || query.moderationStatus || query.fundingStatus || query.projectId || query.founderId || query.createdFrom || query.createdTo || query.updatedFrom || query.updatedTo);

  const activeFilterCount = [searchInput, query.status, query.moderationStatus, query.fundingStatus, query.projectId, query.founderId, query.createdFrom, query.createdTo, query.updatedFrom, query.updatedTo].filter(value => value !== undefined && value !== '').length;
  return (
    <div className="workspace-page">
      <PageHeader
        eyebrow={t('centralAdmin.eyebrow')}
        title={t('centralAdmin.opportunities.title')}
        description={t('centralAdmin.opportunities.description')}
      />

      <section className="enterprise-panel mt-6" aria-label={t('centralAdmin.opportunities.filtersLabel')}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 text-sm font-medium text-foreground">
            {t('centralAdmin.opportunities.search')}
            <span className="relative mt-1 block">
              <Icon name="search" className="pointer-events-none absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={searchInput} onChange={event => setSearchInput(event.target.value)} className="w-full rounded-md border border-border bg-background py-2 ps-9 pe-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder={t('centralAdmin.opportunities.searchPlaceholder')} aria-label={t('centralAdmin.opportunities.search')} />
            </span>
          </label>
          <label className="w-full text-sm font-medium text-foreground sm:w-64">
            {t('centralAdmin.opportunities.lifecycleFilter')}
            <select value={query.status || ''} onChange={event => setQuery(current => ({ ...current, page: 1, status: (event.target.value || undefined) as OpportunityStatus | undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">{t('centralAdmin.opportunities.allStatuses')}</option>
              {OPPORTUNITY_STATUSES.map(status => <option key={status} value={status}>{labelFor(t, 'lifecycle', status)}</option>)}
            </select>
          </label>
          <label className="w-full text-sm font-medium text-foreground sm:w-64">
            {t('centralAdmin.opportunities.moderationFilter')}
            <select value={query.moderationStatus || ''} onChange={event => setQuery(current => ({ ...current, page: 1, moderationStatus: (event.target.value || undefined) as OpportunityModerationStatus | undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">{t('centralAdmin.opportunities.allModerationStatuses')}</option>
              {OPPORTUNITY_MODERATION_STATUSES.map(status => <option key={status} value={status}>{labelFor(t, 'moderation', status)}</option>)}
            </select>
          </label>
          <label className="w-full text-sm font-medium text-foreground sm:w-64">
            {t('centralAdmin.opportunities.fundingFilter')}
            <select value={query.fundingStatus || ''} onChange={event => setQuery(current => ({ ...current, page: 1, fundingStatus: (event.target.value || undefined) as OpportunityFundingStatus | undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">{t('centralAdmin.opportunities.allFundingStatuses')}</option>
              {OPPORTUNITY_FUNDING_STATUSES.map(status => <option key={status} value={status}>{labelFor(t, 'funding', status)}</option>)}
            </select>
          </label>
          <button type="button" className="btn-secondary" onClick={resetFilters} disabled={!hasFilters}><Icon name="reset" className="btn-icon" />{t('centralAdmin.opportunities.actions.reset')}{activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</button>
        </div>
        <details className="mt-4 rounded-md border border-border/70 p-3">
          <summary className="cursor-pointer text-sm font-medium text-foreground">{t('centralAdmin.opportunities.advancedFilters')}</summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-foreground">{t('centralAdmin.opportunities.projectIdFilter')}<input type="number" min="1" inputMode="numeric" value={query.projectId ?? ''} onChange={event => setQuery(current => ({ ...current, page: 1, projectId: numericFilterValue(event.target.value) }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">{t('centralAdmin.opportunities.founderIdFilter')}<input value={query.founderId ?? ''} onChange={event => setQuery(current => ({ ...current, page: 1, founderId: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">{t('centralAdmin.opportunities.createdFrom')}<input type="date" value={query.createdFrom?.slice(0, 10) ?? ''} onChange={event => setQuery(current => ({ ...current, page: 1, createdFrom: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">{t('centralAdmin.opportunities.createdTo')}<input type="date" value={query.createdTo?.slice(0, 10) ?? ''} onChange={event => setQuery(current => ({ ...current, page: 1, createdTo: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">{t('centralAdmin.opportunities.updatedFrom')}<input type="date" value={query.updatedFrom?.slice(0, 10) ?? ''} onChange={event => setQuery(current => ({ ...current, page: 1, updatedFrom: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">{t('centralAdmin.opportunities.updatedTo')}<input type="date" value={query.updatedTo?.slice(0, 10) ?? ''} onChange={event => setQuery(current => ({ ...current, page: 1, updatedTo: event.target.value || undefined }))} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t('centralAdmin.opportunities.dateUtcNote')}</p>
        </details>
        <p className="mt-3 text-xs text-muted-foreground">{t('centralAdmin.opportunities.filterScope')}</p>
      </section>

      <section className="enterprise-panel mt-4 overflow-hidden" aria-live="polite">
        {loading ? <TableSkeleton label={t('centralAdmin.opportunities.loading')} /> : error ? <OpportunityError error={error} onRetry={() => setReloadToken(value => value + 1)} /> : rows.length === 0 ? (
          <EmptyState
            icon="search"
            title={t('centralAdmin.opportunities.emptyTitle')}
            description={t(hasFilters ? 'centralAdmin.opportunities.emptyFiltered' : 'centralAdmin.opportunities.emptyDescription')}
            secondaryAction={hasFilters ? { label: t('centralAdmin.opportunities.actions.reset'), onClick: resetFilters, icon: 'reset' } : undefined}
          />
        ) : (
          <>
            <div className="admin-table-viewport overflow-x-auto">
              <table className="admin-data-table min-w-[1380px] w-full" aria-label={t('centralAdmin.opportunities.tableLabel')}>
                <thead>
                  <tr>
                    {(['title', 'founder', 'project', 'status', 'moderation', 'funding', 'projectStage', 'fundingTarget', 'createdAt', 'updatedAt'] as SortBy[]).map(column => (
                      <th key={column} scope="col" className="text-start" aria-sort={query.sortBy === column ? (query.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                        <button type="button" className="font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => sort(column)} aria-label={sortLabel(column)}>{sortLabel(column)}</button>
                      </th>
                    ))}
                    <th scope="col" className="text-end">{t('centralAdmin.opportunities.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => <OpportunityRow key={row.id} row={row} language={i18n.language} t={t} />)}
                </tbody>
              </table>
            </div>
            <footer className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span dir="ltr">{t('centralAdmin.opportunities.showing', { from: total ? ((query.page - 1) * query.pageSize) + 1 : 0, to: Math.min(query.page * query.pageSize, total), total })}</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">{t('centralAdmin.opportunities.rows')}<select value={query.pageSize} onChange={event => setQuery(current => ({ ...current, page: 1, pageSize: Number(event.target.value) }))} className="rounded-md border border-border bg-background px-2 py-1 text-foreground"><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border disabled:opacity-40" onClick={() => setQuery(current => ({ ...current, page: Math.max(1, current.page - 1) }))} disabled={query.page <= 1} aria-label={t('centralAdmin.opportunities.previous')}><span aria-hidden="true">‹</span></button>
                <span dir="ltr" className="min-w-16 text-center tabular-nums">{query.page} / {pageCount}</span>
                <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border disabled:opacity-40" onClick={() => setQuery(current => ({ ...current, page: Math.min(pageCount, current.page + 1) }))} disabled={query.page >= pageCount} aria-label={t('centralAdmin.opportunities.next')}><span aria-hidden="true">›</span></button>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
};

const OpportunityRow: React.FC<{ row: OpportunityListItem; language: string; t: (key: string, options?: Record<string, unknown>) => string }> = ({ row, language, t }) => (
  <tr>
    <td className="max-w-[320px]">
      <Link className="font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" to={`/admin/fopx/opportunities/${row.id}`}>{row.title}</Link>
      <span className="mt-1 block font-mono text-[11px] text-muted-foreground" dir="ltr">#{row.id}</span>
    </td>
    <td><div className="font-medium text-foreground">{row.founder.name}</div>{row.founder.email && <div className="mt-1 text-xs text-muted-foreground" dir="ltr">{row.founder.email}</div>}</td>
    <td><div className="font-medium text-foreground">{row.projectDisplayName || '—'}</div><div className="mt-1 font-mono text-[11px] text-muted-foreground" dir="ltr">#{row.projectId}</div></td>
    <td><StatusText value={row.status} group="lifecycle" t={t} /></td>
    <td><StatusText value={row.moderationStatus} group="moderation" t={t} /></td>
    <td><StatusText value={row.fundingStatus} group="funding" t={t} /></td>
    <td className="text-sm text-muted-foreground">{labelFor(t, 'projectStage', row.projectStage)}</td>
    <td className="whitespace-nowrap text-sm tabular-nums text-foreground" dir="ltr">{amountLabel(row.fundingTarget, language)} {row.fundingCurrency}</td>
    <td className="whitespace-nowrap text-sm text-muted-foreground" dir="ltr">{dateLabel(row.createdAt, language)}</td>
    <td className="whitespace-nowrap text-sm text-muted-foreground" dir="ltr">{dateLabel(row.updatedAt, language)}</td>
    <td className="text-end"><TableRowActions openTo={`/admin/fopx/opportunities/${row.id}`} openLabel={t('centralAdmin.opportunities.actions.view')} overflowLabel={t('centralAdmin.opportunities.columns.actions')}><OverflowMenuItem to={`/admin/fopx/opportunities/${row.id}`} icon="search">{t('centralAdmin.opportunities.actions.view')}</OverflowMenuItem></TableRowActions></td>
  </tr>
);
