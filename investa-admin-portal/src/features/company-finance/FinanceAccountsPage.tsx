import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, Search } from 'lucide-react';
import { usePermissions } from '@/context/AuthContext';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { FinanceAccount, FinanceAccountInput, FinanceAccountType } from './types';
import { FinanceEmpty, FinanceError, FinanceLoading, FinancePermissionDenied } from './CompanyFinanceStates';

const accountTypes: FinanceAccountType[] = [
  'BankAccount',
  'CompanyCard',
  'Cash',
  'PaymentGateway',
  'ForeignCurrencyAccount',
  'Other',
];

const emptyAccount: FinanceAccountInput = {
  code: '',
  name: '',
  description: '',
  accountType: 'BankAccount',
  currency: 'EGP',
  bankName: '',
  bankAccountNumber: '',
  openingDate: '',
  isActive: true,
};

const displayValue = (value?: string | null) => value?.trim() || '-';
const lastFourDigits = (value?: string | null) => value?.slice(-4) || '-';
const pageSize = 10;

export const FinanceAccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasAnyPermission } = usePermissions();
  const canView = hasAnyPermission('Finance.View');
  const canManage = hasAnyPermission('Finance.ManageMasterData');

  const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(null);
  const [form, setForm] = useState<FinanceAccountInput>(emptyAccount);
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await companyFinanceService.getAccounts());
    } catch {
      setError(t('companyFinance.accounts.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (canView) {
      void loadAccounts();
    } else {
      setLoading(false);
    }
  }, [canView, loadAccounts]);

  const currencies = useMemo(
    () => [...new Set(accounts.map((account) => account.currency).filter(Boolean))].sort(),
    [accounts],
  );

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return accounts.filter((account) => {
      const searchable = `${account.name} ${account.bankName || ''} ${account.bankAccountNumber || ''}`.toLowerCase();
      return (!normalizedSearch || searchable.includes(normalizedSearch))
        && (!typeFilter || account.accountType === typeFilter)
        && (!currencyFilter || account.currency === currencyFilter)
        && (!statusFilter || String(account.isActive) === statusFilter);
    });
  }, [accounts, currencyFilter, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const pagedAccounts = useMemo(
    () => filteredAccounts.slice((page - 1) * pageSize, page * pageSize),
    [filteredAccounts, page],
  );
  const showingFrom = filteredAccounts.length ? (page - 1) * pageSize + 1 : 0;
  const showingTo = Math.min(page * pageSize, filteredAccounts.length);
  const hasActiveFilters = Boolean(search || typeFilter || currencyFilter || statusFilter);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, currencyFilter, statusFilter]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCurrencyFilter('');
    setStatusFilter('');
  };

  const openCreate = () => {
    setEditingAccount(null);
    setForm(emptyAccount);
    setValidationError('');
    setIsModalOpen(true);
  };

  const openEdit = (account: FinanceAccount) => {
    setEditingAccount(account);
    setForm({
      code: account.code,
      name: account.name,
      description: account.description || '',
      accountType: accountTypes.includes(account.accountType) ? account.accountType : 'Other',
      currency: account.currency,
      bankName: account.bankName || '',
      bankAccountNumber: account.bankAccountNumber || '',
      openingDate: account.openingDate?.slice(0, 10) || '',
      isActive: account.isActive,
    });
    setValidationError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) {
      setIsModalOpen(false);
    }
  };

  const updateForm = <K extends keyof FinanceAccountInput>(key: K, value: FinanceAccountInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveAccount = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      setValidationError(t('companyFinance.accounts.requiredFields'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const input: FinanceAccountInput = {
        ...form,
        code: form.code.trim(),
        name: form.name.trim(),
        currency: form.currency.trim().toUpperCase(),
        description: form.description?.trim() || undefined,
        bankName: form.bankName?.trim() || undefined,
        bankAccountNumber: form.bankAccountNumber?.trim() || undefined,
        openingDate: form.openingDate || undefined,
      };
      if (editingAccount) {
        await companyFinanceService.updateAccount(editingAccount.id, input);
      } else {
        await companyFinanceService.createAccount(input);
      }
      setIsModalOpen(false);
      await loadAccounts();
    } catch {
      setError(t('companyFinance.accounts.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const formatAccountType = (accountType: FinanceAccountType) => (
    accountTypes.includes(accountType)
      ? t(`companyFinance.accounts.types.${accountType}`)
      : t('companyFinance.accounts.types.Other')
  );

  if (!canView) return <FinancePermissionDenied />;
  if (loading) return <FinanceLoading />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('companyFinance.accounts.title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('companyFinance.accounts.subtitle')}</p>
        </div>
        {canManage && <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"><Plus size={16} />{t('companyFinance.accounts.add')}</button>}
      </div>

      {error && <FinanceError message={error} />}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(150px,1fr))_auto] dark:border-slate-700">
          <label className="relative block"><Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('companyFinance.accounts.search')} className="w-full rounded-lg border border-slate-300 bg-white py-2 pe-3 ps-9 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-800 dark:text-white" /></label>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option value="">{t('companyFinance.accounts.allTypes')}</option>
            {accountTypes.map((accountType) => <option key={accountType} value={accountType}>{formatAccountType(accountType)}</option>)}
          </select>
          <select value={currencyFilter} onChange={(event) => setCurrencyFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option value="">{t('companyFinance.accounts.allCurrencies')}</option>
            {currencies.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option value="">{t('companyFinance.accounts.allStatuses')}</option>
            <option value="true">{t('companyFinance.accounts.active')}</option>
            <option value="false">{t('companyFinance.accounts.closed')}</option>
          </select>
          <button type="button" onClick={resetFilters} disabled={!hasActiveFilters} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15} />{t('companyFinance.accounts.resetFilters')}</button>
        </div>

        <div className="admin-table-viewport">
          <table className="admin-data-table min-w-[920px] divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                {['name', 'type', 'bank', 'currency', 'openingBalance', 'last4', 'openingDate', 'status', 'actions'].map((column) => <th key={column} className="px-4 py-3 text-start text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{t(`companyFinance.accounts.${column}`)}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {pagedAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-4 py-3"><p className="font-semibold text-slate-900 dark:text-white">{account.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{account.code}</p></td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{formatAccountType(account.accountType)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{displayValue(account.bankName)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300" dir="ltr">{account.currency}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-slate-700 dark:text-slate-300" dir="ltr">{Number(account.currentBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300" dir="ltr">{lastFourDigits(account.bankAccountNumber)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300" dir="ltr">{account.openingDate ? new Date(account.openingDate).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${account.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{t(account.isActive ? 'companyFinance.accounts.active' : 'companyFinance.accounts.closed')}</span></td>
                  <td className="px-4 py-3">{canManage && <button type="button" onClick={() => openEdit(account)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary transition hover:bg-primary/10" title={t('companyFinance.accounts.edit')} aria-label={t('companyFinance.accounts.edit')}><Pencil size={15} /></button>}</td>
                </tr>
              ))}
              {!filteredAccounts.length && <tr><td colSpan={9}><FinanceEmpty /></td></tr>}
            </tbody>
          </table>
        </div>
        {filteredAccounts.length > 0 && <div className="admin-table-footer flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:text-slate-400"><span dir="ltr">{t('companyFinance.accounts.showing', { from: showingFrom, to: showingTo, total: filteredAccounts.length })}</span><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200" aria-label={t('companyFinance.accounts.previousPage')}><ChevronLeft size={16} className="rtl:rotate-180" /></button><span className="min-w-16 text-center tabular-nums" dir="ltr">{page} / {totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200" aria-label={t('companyFinance.accounts.nextPage')}><ChevronRight size={16} className="rtl:rotate-180" /></button></div></div>}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={editingAccount ? t('companyFinance.accounts.edit') : t('companyFinance.accounts.add')}>
          <div className="admin-modal-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingAccount ? t('companyFinance.accounts.edit') : t('companyFinance.accounts.add')}</h3>
            {validationError && <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{validationError}</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.accountCode')}<input value={form.code} onChange={(event) => updateForm('code', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.name')}<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.type')}<select value={form.accountType} onChange={(event) => updateForm('accountType', event.target.value as FinanceAccountType)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">{accountTypes.map((accountType) => <option key={accountType} value={accountType}>{formatAccountType(accountType)}</option>)}</select></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.currency')}<input value={form.currency} maxLength={3} onChange={(event) => updateForm('currency', event.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" dir="ltr" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.bank')}<input value={form.bankName || ''} onChange={(event) => updateForm('bankName', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.last4')}<input value={form.bankAccountNumber || ''} onChange={(event) => updateForm('bankAccountNumber', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" dir="ltr" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.openingDate')}<input type="date" value={form.openingDate || ''} onChange={(event) => updateForm('openingDate', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" dir="ltr" /></label>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.status')}<select value={String(form.isActive)} onChange={(event) => updateForm('isActive', event.target.value === 'true')} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"><option value="true">{t('companyFinance.accounts.active')}</option><option value="false">{t('companyFinance.accounts.closed')}</option></select></label>
              <label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.accounts.notes')}<textarea value={form.description || ''} onChange={(event) => updateForm('description', event.target.value)} rows={3} className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">{t('common.cancel')}</button>
              <button type="button" onClick={() => void saveAccount()} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? t('companyFinance.accounts.saving') : t('common.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
