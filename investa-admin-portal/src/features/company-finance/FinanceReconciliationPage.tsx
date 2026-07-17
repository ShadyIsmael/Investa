import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/context/AuthContext';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { FinanceAccount, FinanceReconciliationDetailDto, FinanceReconciliationListDto } from './types';
import { FinanceEmpty, FinanceError, FinanceLoading, FinancePermissionDenied } from './CompanyFinanceStates';

const PAGE_SIZES = [10, 25, 50];
const safeText = (value?: string | null) => value?.trim() || '-';
const filterControlClass = 'mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';
const filterLabelClass = 'min-w-0 text-[11px] font-medium text-slate-500 dark:text-slate-400';
const statusBadgeClass = (status: string) => {
  if (status === 'Confirmed') return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300';
  if (status === 'Matched') return 'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300';
  if (status === 'DifferenceFound') return 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300';
  return 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-200';
};
const fmtDate = (raw: string) => { try { return new Date(raw).toLocaleDateString('en-GB'); } catch { return raw; } };
const fmtAmount = (value: number, currency: string) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency;

export const FinanceReconciliationPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasAnyPermission } = usePermissions();
  const canView = hasAnyPermission('Finance.View');
  const [items, setItems] = useState<FinanceReconciliationListDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<FinanceReconciliationDetailDto | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [accountId, setAccountId] = useState<number | undefined>();
  const [onlyWithDifference, setOnlyWithDifference] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await companyFinanceService.getReconciliations({ pageNumber: page, pageSize, search: search || undefined, status: status || undefined, dateFrom: fromDate || undefined, dateTo: toDate || undefined, accountId, onlyWithDifference: onlyWithDifference || undefined });
      setItems(result.data);
      setTotalCount(result.totalCount);
    } catch {
      setError(t('companyFinance.reconciliation.loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, status, fromDate, toDate, accountId, onlyWithDifference, t]);

  useEffect(() => {
    if (canView) void load();
    else setLoading(false);
  }, [canView, load]);

  useEffect(() => {
    if (canView) companyFinanceService.getAccounts().then(setAccounts).catch(() => {});
  }, [canView]);

  useEffect(() => { setPage(1); }, [search, status, fromDate, toDate, accountId, onlyWithDifference, pageSize]);

  const reset = () => {
    setSearch('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setAccountId(undefined);
    setOnlyWithDifference(false);
    setPage(1);
  };

  const enumLabel = (group: string, value?: string | null) => value
    ? t(`companyFinance.reconciliation.${group}.${value}`, { defaultValue: value })
    : '-';

  const openDetails = useCallback(async (item: FinanceReconciliationListDto) => {
    try {
      const detail = await companyFinanceService.getReconciliationById(item.id);
      setDetails(detail);
    } catch {
      setError(t('companyFinance.reconciliation.detailsError'));
    }
  }, [t]);

  if (!canView) return <FinancePermissionDenied />;

  const activeFilterCount = [status, fromDate, toDate, accountId, onlyWithDifference].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('companyFinance.reconciliation.title')}</h2>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{t('companyFinance.reconciliation.subtitle')}</p>
        </div>
      </header>
      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-slate-50/50 p-3 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <label className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('companyFinance.reconciliation.search')} className="h-9 w-full rounded-md border border-border bg-card pe-3 ps-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
            <button type="button" onClick={() => setShowFilters((current) => !current)} aria-expanded={showFilters} aria-controls="reconciliation-secondary-filters" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><SlidersHorizontal size={14} />{t(showFilters ? 'companyFinance.reconciliation.hideFilters' : 'companyFinance.reconciliation.showFilters')}{activeFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white" dir="ltr">{activeFilterCount}</span>}</button>
          </div>
          {showFilters && <div id="reconciliation-secondary-filters" className="mt-2.5 border-t border-border pt-2.5">
            <div className="mb-2 flex justify-end"><button type="button" onClick={reset} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-card dark:text-slate-400"><RotateCcw size={13} />{t('companyFinance.reconciliation.reset')}</button></div>
          <div className="grid items-end gap-x-2.5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            <label className={filterLabelClass}>{t('companyFinance.reconciliation.account')}<select className={filterControlClass} value={accountId ?? ''} onChange={(event) => setAccountId(event.target.value ? Number(event.target.value) : undefined)}><option value="">{t('companyFinance.reconciliation.allAccounts')}</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.code})</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.reconciliation.status')}<select className={filterControlClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t('companyFinance.reconciliation.allStatuses')}</option>{['Draft', 'Matched', 'DifferenceFound', 'Confirmed'].map((value) => <option key={value} value={value}>{enumLabel('statuses', value)}</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.reconciliation.fromDate')}<input className={filterControlClass} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} dir="ltr" /></label>
            <label className={filterLabelClass}>{t('companyFinance.reconciliation.toDate')}<input className={filterControlClass} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} dir="ltr" /></label>
            <label className={`${filterLabelClass} flex items-center gap-2 pt-5`}><input type="checkbox" checked={onlyWithDifference} onChange={(event) => setOnlyWithDifference(event.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" /><span className="text-xs font-medium text-foreground">{t('companyFinance.reconciliation.onlyWithDifference')}</span></label>
          </div>
          </div>}
        </div>
        {error && <div className="border-b border-border p-3"><FinanceError message={error} /></div>}
        <div className="admin-table-viewport min-h-0 flex-1">
          <table className="admin-data-table w-full min-w-[960px] table-fixed divide-y dark:divide-slate-700">
            <colgroup><col className="w-[14%]" /><col className="w-[9%]" /><col className="w-[9%]" /><col className="w-[11%]" /><col className="w-[11%]" /><col className="w-[9%]" /><col className="w-[8%]" /><col className="w-[9%]" /><col className="w-[9%]" /><col className="w-[11%]" /></colgroup>
            <thead className="bg-slate-50 dark:bg-slate-800"><tr>{['account', 'period', 'reconciliationDate', 'systemBalance', 'actualBalance', 'difference', 'status', 'created', 'confirmed', 'actions'].map((column) => <th key={column}>{t(`companyFinance.reconciliation.${column}`)}</th>)}</tr></thead>
            <tbody>
              {loading && <tr><td colSpan={10}><FinanceLoading /></td></tr>}
              {items.map((item) => (
                <tr key={item.id} className="h-[68px] transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td><p className="truncate font-medium text-slate-800 dark:text-slate-100">{safeText(item.financeAccountName)}</p><p className="mt-1 truncate text-[11px] text-slate-500">{safeText(item.financeAccountCode)} · {item.financeAccountCurrency}</p></td>
                  <td className="whitespace-nowrap text-xs" dir="ltr">{fmtDate(item.periodEndDate)}</td>
                  <td className="whitespace-nowrap text-xs" dir="ltr">{fmtDate(item.reconciliationDate)}</td>
                  <td className="text-end" dir="ltr"><p className="whitespace-nowrap font-semibold tabular-nums text-slate-900 dark:text-white">{item.systemCalculatedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className="mt-1 text-[11px] font-medium text-slate-500">{item.financeAccountCurrency}</p></td>
                  <td className="text-end" dir="ltr"><p className="whitespace-nowrap font-semibold tabular-nums text-slate-900 dark:text-white">{item.actualStatementBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className="mt-1 text-[11px] font-medium text-slate-500">{item.financeAccountCurrency}</p></td>
                  <td className="text-end" dir="ltr"><p className={`whitespace-nowrap font-semibold tabular-nums ${item.difference === 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>{item.difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></td>
                  <td><span className={`inline-flex max-w-full truncate rounded-full px-2 py-1 text-[11px] font-bold ring-1 ring-inset ${statusBadgeClass(item.status)}`}>{enumLabel('statuses', item.status)}</span></td>
                  <td className="whitespace-nowrap text-xs">{safeText(item.createdByDisplayName)}</td>
                  <td className="whitespace-nowrap text-xs">{safeText(item.confirmedByDisplayName)}</td>
                  <td className="text-center"><button type="button" onClick={() => void openDetails(item)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary transition hover:bg-primary/10" aria-label={t('companyFinance.reconciliation.details')}><Eye size={15} /></button></td>
                </tr>
              ))}
              {!loading && !items.length && <tr><td colSpan={10}><FinanceEmpty /></td></tr>}
            </tbody>
          </table>
        </div>
        {!loading && totalCount > 0 && (
          <footer className="admin-table-footer mt-auto flex min-h-11 items-center justify-between border-t border-border bg-card px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="tabular-nums" dir="ltr">{t('companyFinance.reconciliation.showing', { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, totalCount), total: totalCount })}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5"><select className="h-7 rounded-md border border-border bg-card px-1.5 text-xs text-foreground" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>{PAGE_SIZES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40" type="button" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label={t('companyFinance.reconciliation.previous')}><ChevronLeft size={15} /></button>
              <span className="min-w-8 text-center tabular-nums" dir="ltr">{page}</span>
              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40" type="button" disabled={page >= Math.ceil(totalCount / pageSize)} onClick={() => setPage(page + 1)} aria-label={t('companyFinance.reconciliation.next')}><ChevronRight size={15} /></button>
            </div>
          </footer>
        )}
      </section>
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="reconciliation-details-title">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-5 text-foreground shadow-2xl">
            <div className="flex items-center justify-between"><h3 id="reconciliation-details-title" className="font-bold">{t('companyFinance.reconciliation.title')}</h3><button type="button" onClick={() => setDetails(null)}>{t('common.close')}</button></div>
            <dl className="mt-4 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[160px_1fr]">
              <dt className="text-slate-500">{t('companyFinance.reconciliation.account')}</dt>
              <dd>{safeText(details.financeAccountName)} ({safeText(details.financeAccountCode)}) · {details.financeAccountCurrency}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.reconciliationDate')}</dt>
              <dd dir="ltr">{fmtDate(details.reconciliationDate)}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.period')}</dt>
              <dd dir="ltr">{fmtDate(details.periodStartDate)} {t('companyFinance.reconciliation.to')} {fmtDate(details.periodEndDate)}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.openingBalance')}</dt>
              <dd dir="ltr">{fmtAmount(details.openingBalance, details.financeAccountCurrency ?? '')}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.periodActivity')}</dt>
              <dd dir="ltr">{fmtAmount(details.periodActivity, details.financeAccountCurrency ?? '')}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.systemCalculatedBalance')}</dt>
              <dd dir="ltr">{fmtAmount(details.systemCalculatedBalance, details.financeAccountCurrency ?? '')}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.actualStatementBalance')}</dt>
              <dd dir="ltr">{fmtAmount(details.actualStatementBalance, details.financeAccountCurrency ?? '')}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.difference')}</dt>
              <dd dir="ltr" className={details.difference === 0 ? '' : 'text-rose-600 dark:text-rose-400'}>{fmtAmount(details.difference, details.financeAccountCurrency ?? '')}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.status')}</dt>
              <dd><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ring-1 ring-inset ${statusBadgeClass(details.status)}`}>{enumLabel('statuses', details.status)}</span></dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.notes')}</dt>
              <dd>{safeText(details.notes)}</dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.createdBy')}</dt>
              <dd>{safeText(details.createdByDisplayName)}<span className="text-slate-400"> · {fmtDate(details.createdAt)}</span></dd>
              <dt className="text-slate-500">{t('companyFinance.reconciliation.confirmedBy')}</dt>
              <dd>{details.confirmedByDisplayName ? `${safeText(details.confirmedByDisplayName)} · ${fmtDate(details.confirmedAt!)}` : '-'}</dd>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};
