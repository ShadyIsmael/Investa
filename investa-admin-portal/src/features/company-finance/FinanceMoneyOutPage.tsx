import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Plus, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/context/AuthContext';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { FinanceTransaction } from './types';
import { FinanceEmpty, FinanceError, FinanceLoading, FinancePermissionDenied } from './CompanyFinanceStates';
import { FinanceTransactionHistory } from './FinanceTransactionHistory';
import { FinanceWorkflowActions } from './FinanceWorkflowActions';

const PAGE_SIZES = [10, 25, 50];
const safeText = (value?: string | null) => value?.trim() || '-';
const dayValue = (value: string) => value.slice(0, 10);
const filterControlClass = 'mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15';
const filterLabelClass = 'min-w-0 text-[11px] font-medium text-slate-500 dark:text-slate-400';
const statusBadgeClass = (status: string) => {
  if (status === 'Confirmed') return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300';
  if (status === 'Rejected' || status === 'Cancelled') return 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-300';
  if (status === 'ReadyForReview') return 'bg-blue-100 text-blue-800 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-300';
  if (status === 'NeedsDocuments') return 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-300';
  return 'bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-200';
};

export const FinanceMoneyOutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasAnyPermission } = usePermissions();
  const canView = hasAnyPermission('Finance.View');
  const canCreate = hasAnyPermission('Finance.Create');
  const [items, setItems] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<FinanceTransaction | null>(null);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [supplier, setSupplier] = useState('');
  const [currency, setCurrency] = useState('');
  const [method, setMethod] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listRows = (await companyFinanceService.getTransactions()).filter((item) => item.transactionType === 'MoneyOut');
      const enrichedRows = await Promise.all(listRows.map(async (item) => {
        try {
          return await companyFinanceService.getTransaction(item.id);
        } catch {
          return item;
        }
      }));
      setItems(enrichedRows);
    } catch {
      setError(t('companyFinance.moneyOut.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (canView) void load();
    else setLoading(false);
  }, [canView, load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return items.filter((item) => {
      const haystack = [
        item.referenceNumber,
        item.description,
        item.supplierName,
        item.invoiceNumber,
        item.externalReference,
        item.amount,
      ].filter((value) => value !== null && value !== undefined).join(' ').toLocaleLowerCase();
      const date = dayValue(item.transactionDate);
      return (!query || haystack.includes(query))
        && (!fromDate || date >= fromDate)
        && (!toDate || date <= toDate)
        && (!status || item.status === status)
        && (!documentation || item.documentationStatus === documentation)
        && (!category || String(item.expenseCategoryId ?? '') === category)
        && (!account || String(item.sourceAccountId ?? '') === account)
        && (!supplier || String(item.supplierId ?? '') === supplier)
        && (!currency || item.currency === currency)
        && (!method || item.paymentMethod === method);
    });
  }, [account, category, currency, documentation, fromDate, items, method, search, status, supplier, toDate]);

  const unique = (values: Array<string | null | undefined>) => [...new Set(values.filter((value): value is string => Boolean(value)))];
  const statuses = unique(items.map((item) => item.status));
  const documentationStatuses = unique(items.map((item) => item.documentationStatus));
  const categories = [...new Map(items.filter((item) => item.expenseCategoryId).map((item) => [String(item.expenseCategoryId), safeText(item.expenseCategoryName)])).entries()];
  const accounts = [...new Map(items.filter((item) => item.sourceAccountId).map((item) => [String(item.sourceAccountId), safeText(item.sourceAccountName)])).entries()];
  const suppliers = [...new Map(items.filter((item) => item.supplierId).map((item) => [String(item.supplierId), safeText(item.supplierName)])).entries()];
  const currencies = unique(items.map((item) => item.currency));
  const methods = unique(items.map((item) => item.paymentMethod));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const from = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, filtered.length);
  const activeFilterCount = [fromDate, toDate, status, documentation, category, account, supplier, currency, method].filter(Boolean).length;

  useEffect(() => setPage(1), [account, category, currency, documentation, fromDate, method, pageSize, search, status, supplier, toDate]);

  const reset = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setStatus('');
    setDocumentation('');
    setCategory('');
    setAccount('');
    setSupplier('');
    setCurrency('');
    setMethod('');
    setPage(1);
  };
  const enumLabel = (group: string, value?: string | null) => value
    ? t(`companyFinance.moneyOut.${group}.${value}`, { defaultValue: value })
    : '-';

  if (!canView) return <FinancePermissionDenied />;

  return (
    <div className="space-y-3">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('companyFinance.moneyOut.title')}</h2>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{t('companyFinance.moneyOut.subtitle')} <span className="mx-1 text-slate-300 dark:text-slate-600">·</span> <span dir="ltr">{t('companyFinance.moneyOut.resultCount', { count: filtered.length })}</span></p>
        </div>
        {canCreate && (
            <button type="button" onClick={() => navigate('/admin/company-finance/money-out/new')} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
              <Plus size={16} />{t('companyFinance.moneyOut.add')}
            </button>
        )}
      </header>
      <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-slate-50/50 p-3 dark:bg-slate-900/30">
          <div className="flex items-center gap-2.5">
            <label className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('companyFinance.moneyOut.search')} className="h-9 w-full rounded-md border border-border bg-card pe-3 ps-9 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
            <button type="button" onClick={() => setShowFilters((current) => !current)} aria-expanded={showFilters} aria-controls="money-out-secondary-filters" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><SlidersHorizontal size={14} />{t(showFilters ? 'companyFinance.moneyOut.hideFilters' : 'companyFinance.moneyOut.showFilters')}{activeFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white" dir="ltr">{activeFilterCount}</span>}</button>
          </div>
          {showFilters && <div id="money-out-secondary-filters" className="mt-2.5 border-t border-border pt-2.5">
            <div className="mb-2 flex justify-end"><button type="button" onClick={reset} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-card dark:text-slate-400"><RotateCcw size={13} />{t('companyFinance.moneyOut.reset')}</button></div>
          <div className="grid items-end gap-x-2.5 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.fromDate')}<input className={filterControlClass} type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} dir="ltr" /></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.toDate')}<input className={filterControlClass} type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} dir="ltr" /></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.status')}<select className={filterControlClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">{t('companyFinance.moneyOut.allStatuses')}</option>{statuses.map((value) => <option key={value} value={value}>{enumLabel('statuses', value)}</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.documentationStatus')}<select className={filterControlClass} value={documentation} onChange={(event) => setDocumentation(event.target.value)}><option value="">{t('companyFinance.moneyOut.allDocumentation')}</option>{documentationStatuses.map((value) => <option key={value} value={value}>{enumLabel('documentation', value)}</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.expenseCategory')}<select className={filterControlClass} value={category} onChange={(event) => setCategory(event.target.value)}><option value="">{t('companyFinance.moneyOut.allCategories')}</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.sourceAccount')}<select className={filterControlClass} value={account} onChange={(event) => setAccount(event.target.value)}><option value="">{t('companyFinance.moneyOut.allAccounts')}</option>{accounts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.supplierPayee')}<select className={filterControlClass} value={supplier} onChange={(event) => setSupplier(event.target.value)}><option value="">{t('companyFinance.moneyOut.allSuppliers')}</option>{suppliers.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.currency')}<select className={filterControlClass} value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">{t('companyFinance.moneyOut.allCurrencies')}</option>{currencies.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className={filterLabelClass}>{t('companyFinance.moneyOut.paymentMethod')}<select className={filterControlClass} value={method} onChange={(event) => setMethod(event.target.value)}><option value="">{t('companyFinance.moneyOut.allMethods')}</option>{methods.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          </div>
          </div>}
        </div>
        {error && <div className="border-b border-border p-3"><FinanceError message={error} /></div>}
        <div className="admin-table-viewport min-h-0 flex-1">
          <table className="admin-data-table w-full min-w-[960px] table-fixed divide-y dark:divide-slate-700">
            <colgroup><col className="w-[14%]" /><col className="w-[9%]" /><col className="w-[14%]" /><col className="w-[14%]" /><col className="w-[13%]" /><col className="w-[16%]" /><col className="w-[10%]" /><col className="w-[10%]" /></colgroup>
            <thead className="bg-slate-50 dark:bg-slate-800"><tr>{['reference', 'date', 'expenseCategory', 'supplierPayee', 'amount', 'sourceAccount', 'status', 'actions'].map((column) => <th key={column}>{t(`companyFinance.moneyOut.${column}`)}</th>)}</tr></thead>
            <tbody>
              {loading && <tr><td colSpan={8}><FinanceLoading /></td></tr>}
              {rows.map((item) => (
                <tr key={item.id} className="h-[68px] transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="truncate font-mono text-xs font-semibold text-slate-800 dark:text-slate-100" dir="ltr">{safeText(item.referenceNumber)}<p className="mt-1 truncate font-sans text-[11px] font-normal text-slate-500" dir="auto">{t('companyFinance.moneyOut.maker')}: {safeText(item.makerDisplayName)}</p></td>
                  <td className="whitespace-nowrap text-xs" dir="ltr">{new Date(item.transactionDate).toLocaleDateString('en-GB')}</td>
                  <td><p className="truncate font-medium text-slate-800 dark:text-slate-100">{safeText(item.expenseCategoryName)}</p><p className="mt-1 truncate text-[11px] text-slate-500">{enumLabel('documentation', item.documentationStatus)}</p></td>
                  <td><p className="truncate font-medium text-slate-800 dark:text-slate-100">{safeText(item.supplierName)}</p><p className="mt-1 truncate text-[11px] text-slate-500">{safeText(item.paymentMethod)}</p></td>
                  <td className="text-end" dir="ltr"><p className="whitespace-nowrap font-semibold tabular-nums text-slate-900 dark:text-white">{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p><p className="mt-1 text-[11px] font-medium text-slate-500">{item.currency}</p></td>
                  <td><p className="truncate font-medium text-slate-800 dark:text-slate-100">{safeText(item.sourceAccountName)}</p><p className="mt-1 truncate text-[11px] text-slate-500" dir="auto">{item.invoiceNumber ? `${t('companyFinance.moneyOut.invoiceShort')}: ${item.invoiceNumber}` : ''}{item.invoiceNumber && item.externalReference ? ' · ' : ''}{item.externalReference ? `${t('companyFinance.moneyOut.externalShort')}: ${item.externalReference}` : ''}{!item.invoiceNumber && !item.externalReference ? '-' : ''}</p></td>
                  <td><span className={`inline-flex max-w-full truncate rounded-full px-2 py-1 text-[11px] font-bold ring-1 ring-inset ${statusBadgeClass(item.status)}`}>{enumLabel('statuses', item.status)}</span></td>
                  <td className="text-center"><div className="flex items-center justify-center gap-1"><button type="button" onClick={() => void companyFinanceService.getTransaction(item.id).then(setDetails).catch(() => setError(t('companyFinance.moneyOut.detailsError')))} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary transition hover:bg-primary/10" aria-label={t('companyFinance.moneyOut.details')}><Eye size={15} /></button><FinanceWorkflowActions compact transaction={item} onEdit={() => navigate(`/admin/company-finance/money-out/${item.id}/edit`)} onUpdated={(updated) => { setItems((current) => current.map((row) => row.id === updated.id ? updated : row)); if (details?.id === updated.id) setDetails(updated); void load(); }} /></div></td>
                </tr>
              ))}
              {!loading && !filtered.length && <tr><td colSpan={8}><FinanceEmpty /></td></tr>}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <footer className="admin-table-footer mt-auto flex min-h-11 items-center justify-between border-t border-border bg-card px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="tabular-nums" dir="ltr">{t('companyFinance.moneyOut.showing', { from, to, total: filtered.length })}</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5"><span>{t('companyFinance.moneyOut.rows')}</span><select className="h-7 rounded-md border border-border bg-card px-1.5 text-xs text-foreground" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>{PAGE_SIZES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40" type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label={t('companyFinance.moneyOut.previous')}><ChevronLeft size={15} /></button>
              <span className="min-w-10 text-center tabular-nums" dir="ltr">{currentPage}/{pageCount}</span>
              <button className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border disabled:opacity-40" type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label={t('companyFinance.moneyOut.next')}><ChevronRight size={15} /></button>
            </div>
          </footer>
        )}
      </section>
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="money-out-details-title">
          <div className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-5 text-foreground shadow-2xl">
            <div className="flex items-center justify-between"><h3 id="money-out-details-title" className="font-bold" dir="ltr">{details.referenceNumber}</h3><button type="button" onClick={() => setDetails(null)}>{t('common.close')}</button></div>
            <dl className="mt-4 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[160px_1fr]">
              {[
                ['description', details.description], ['notes', details.notes], ['expenseCategory', details.expenseCategoryName], ['supplierPayee', details.supplierName], ['sourceAccount', details.sourceAccountName], ['paymentMethod', details.paymentMethod], ['invoiceNumber', details.invoiceNumber], ['externalReference', details.externalReference],
              ].map(([label, value]) => <React.Fragment key={label}><dt className="text-slate-500">{t(`companyFinance.moneyOut.${label}`)}</dt><dd>{safeText(value)}</dd></React.Fragment>)}
              <dt className="text-slate-500">{t('companyFinance.moneyOut.amount')}</dt><dd dir="ltr">{details.amount.toLocaleString('en-US')} {details.currency}</dd>
            </dl>
            <FinanceTransactionHistory transaction={details} statusLabel={enumLabel('statuses', details.status)} />
            <div className="mt-5 border-t border-border pt-4"><FinanceWorkflowActions transaction={details} onEdit={() => navigate(`/admin/company-finance/money-out/${details.id}/edit`)} onUpdated={(updated) => { setDetails(updated); setItems((current) => current.map((row) => row.id === updated.id ? updated : row)); void load(); }} /></div>
          </div>
        </div>
      )}
    </div>
  );
};
