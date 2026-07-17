import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/context/AuthContext';
import { companyFinanceService } from '@/services/companyFinanceService';
import type { FinanceSupplier, FinanceSupplierInput, FinanceSupplierType } from './types';
import { FinanceEmpty, FinanceError, FinanceLoading, FinancePermissionDenied } from './CompanyFinanceStates';

const supplierTypes: FinanceSupplierType[] = ['Company', 'IndividualServiceProvider', 'Freelancer', 'GlobalServiceProvider', 'Other'];
const pageSizeOptions = [10, 25, 50];
const emptySupplier: FinanceSupplierInput = { name: '', supplierType: 'Company', serviceCategory: '', legalName: '', country: '', email: '', phoneNumber: '', taxId: '', paymentDetails: '', paymentTerms: '', notes: '', isActive: true };
const displayValue = (value?: string | null) => value?.trim() || '-';

export const FinanceSuppliersPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasAnyPermission } = usePermissions();
  const canView = hasAnyPermission('Finance.View');
  const canManage = hasAnyPermission('Finance.ManageMasterData');
  const [suppliers, setSuppliers] = useState<FinanceSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<FinanceSupplier | null>(null);
  const [form, setForm] = useState<FinanceSupplierInput>(emptySupplier);
  const [validationError, setValidationError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSuppliers = useCallback(async () => {
    setLoading(true); setError(null);
    try { setSuppliers(await companyFinanceService.getSuppliers()); }
    catch { setError(t('companyFinance.suppliers.loadError')); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { if (canView) void loadSuppliers(); else setLoading(false); }, [canView, loadSuppliers]);
  useEffect(() => {
    if (!modalOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [modalOpen]);

  const categories = useMemo(() => [...new Set(suppliers.map((supplier) => supplier.serviceCategory).filter(Boolean))].sort(), [suppliers]);
  const countries = useMemo(() => [...new Set(suppliers.map((supplier) => supplier.country).filter((value): value is string => Boolean(value)))].sort(), [suppliers]);
  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const values = [supplier.supplierCode, supplier.name, supplier.legalName, supplier.email, supplier.phoneNumber, supplier.taxId].filter(Boolean).join(' ').toLowerCase();
      return (!query || values.includes(query))
        && (!typeFilter || supplier.supplierType === typeFilter)
        && (!categoryFilter || supplier.serviceCategory === categoryFilter)
        && (!countryFilter || supplier.country === countryFilter)
        && (!statusFilter || String(supplier.isActive) === statusFilter);
    });
  }, [categoryFilter, countryFilter, search, statusFilter, suppliers, typeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize));
  const pagedSuppliers = useMemo(() => filteredSuppliers.slice((page - 1) * pageSize, page * pageSize), [filteredSuppliers, page, pageSize]);
  const showingFrom = filteredSuppliers.length ? (page - 1) * pageSize + 1 : 0;
  const showingTo = Math.min(page * pageSize, filteredSuppliers.length);
  const hasFilters = Boolean(search || typeFilter || categoryFilter || countryFilter || statusFilter);

  useEffect(() => { setPage(1); }, [search, typeFilter, categoryFilter, countryFilter, statusFilter, pageSize]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const resetFilters = () => { setSearch(''); setTypeFilter(''); setCategoryFilter(''); setCountryFilter(''); setStatusFilter(''); };
  const openCreate = () => { setEditingSupplier(null); setForm(emptySupplier); setValidationError(''); setModalOpen(true); };
  const openEdit = (supplier: FinanceSupplier) => {
    setEditingSupplier(supplier);
    setForm({ name: supplier.name, supplierType: supplier.supplierType, serviceCategory: supplier.serviceCategory, legalName: supplier.legalName || '', country: supplier.country || '', email: supplier.email || '', phoneNumber: supplier.phoneNumber || '', taxId: supplier.taxId || '', paymentDetails: supplier.paymentDetails || '', paymentTerms: supplier.paymentTerms || '', notes: supplier.notes || '', isActive: supplier.isActive });
    setValidationError(''); setModalOpen(true);
  };
  const updateForm = <K extends keyof FinanceSupplierInput>(key: K, value: FinanceSupplierInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const supplierTypeLabel = (type: FinanceSupplierType) => t(`companyFinance.suppliers.types.${type}`);

  const saveSupplier = async () => {
    if (!form.name.trim() || !form.serviceCategory.trim()) { setValidationError(t('companyFinance.suppliers.requiredFields')); return; }
    const email = form.email?.trim();
    const phone = form.phoneNumber?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setValidationError(t('companyFinance.suppliers.invalidEmail')); return; }
    if (phone && !/^[+()\d\s-]{6,20}$/.test(phone)) { setValidationError(t('companyFinance.suppliers.invalidPhone')); return; }
    setSaving(true); setError(null);
    try {
      const compact = (value?: string) => value?.trim() || undefined;
      const input: FinanceSupplierInput = { name: form.name.trim(), supplierType: form.supplierType, serviceCategory: form.serviceCategory.trim(), legalName: compact(form.legalName), country: compact(form.country), email, phoneNumber: phone, taxId: compact(form.taxId), paymentDetails: compact(form.paymentDetails), paymentTerms: compact(form.paymentTerms), notes: compact(form.notes), isActive: form.isActive };
      if (editingSupplier) await companyFinanceService.updateSupplier(editingSupplier.id, input); else await companyFinanceService.createSupplier(input);
      setModalOpen(false); await loadSuppliers();
    } catch { setError(t('companyFinance.suppliers.saveError')); }
    finally { setSaving(false); }
  };

  if (!canView) return <FinancePermissionDenied />;
  if (loading) return <FinanceLoading />;

  const fieldClass = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-800 dark:text-white';
  return <div className="space-y-4">
    <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('companyFinance.suppliers.title')}</h2><p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t('companyFinance.suppliers.subtitle')}</p></div>{canManage && <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"><Plus size={16} />{t('companyFinance.suppliers.add')}</button>}</header>
    {error && <FinanceError message={error} />}
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid gap-2.5 border-b border-slate-200 bg-slate-50/60 p-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_repeat(4,minmax(140px,1fr))_auto] dark:border-slate-700 dark:bg-slate-800/40"><label className="relative block"><Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('companyFinance.suppliers.search')} className="w-full rounded-lg border border-slate-300 bg-white py-2 pe-3 ps-9 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-slate-600 dark:bg-slate-800 dark:text-white" /></label><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={fieldClass.replace('mt-1 ', '')}><option value="">{t('companyFinance.suppliers.allSupplierTypes')}</option>{supplierTypes.map((type) => <option key={type} value={type}>{supplierTypeLabel(type)}</option>)}</select><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={fieldClass.replace('mt-1 ', '')}><option value="">{t('companyFinance.suppliers.allServiceCategories')}</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} className={fieldClass.replace('mt-1 ', '')}><option value="">{t('companyFinance.suppliers.allCountries')}</option>{countries.map((country) => <option key={country} value={country}>{country}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={fieldClass.replace('mt-1 ', '')}><option value="">{t('companyFinance.suppliers.allStatuses')}</option><option value="true">{t('companyFinance.suppliers.active')}</option><option value="false">{t('companyFinance.suppliers.inactive')}</option></select><button type="button" onClick={resetFilters} disabled={!hasFilters} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15} />{t('companyFinance.suppliers.resetFilters')}</button></div>
      <div className="admin-table-viewport"><table className="admin-data-table min-w-[860px] divide-y divide-slate-200 dark:divide-slate-700"><thead className="bg-slate-50 dark:bg-slate-800"><tr>{['code', 'name', 'supplierType', 'serviceCategory', 'country', 'status', 'actions'].map((column) => <th key={column} className="text-start font-semibold uppercase text-slate-500 dark:text-slate-400">{t(`companyFinance.suppliers.${column}`)}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-700">{pagedSuppliers.map((supplier) => <tr key={supplier.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50"><td className="font-mono text-xs text-slate-600 dark:text-slate-300" dir="ltr">{supplier.supplierCode}</td><td><p className="font-semibold text-slate-900 dark:text-white">{supplier.name}</p>{supplier.legalName && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{supplier.legalName}</p>}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{supplierTypeLabel(supplier.supplierType)}</span></td><td><span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{supplier.serviceCategory}</span></td><td>{displayValue(supplier.country)}</td><td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${supplier.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{t(supplier.isActive ? 'companyFinance.suppliers.active' : 'companyFinance.suppliers.inactive')}</span></td><td>{canManage && <button type="button" onClick={() => openEdit(supplier)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary transition hover:bg-primary/10" title={t('companyFinance.suppliers.edit')} aria-label={t('companyFinance.suppliers.edit')}><Pencil size={15} /></button>}</td></tr>)}{!filteredSuppliers.length && <tr><td colSpan={7}><FinanceEmpty /></td></tr>}</tbody></table></div>
      {filteredSuppliers.length > 0 && <footer className="admin-table-footer flex flex-col gap-2 border-t border-slate-200 px-3 py-2.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:text-slate-400"><span dir="ltr">{t('companyFinance.suppliers.showing', { from: showingFrom, to: showingTo, total: filteredSuppliers.length })}</span><div className="flex items-center gap-3"><label className="flex items-center gap-2"><span>{t('companyFinance.suppliers.rowsPerPage')}</span><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">{pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select></label><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200" aria-label={t('companyFinance.suppliers.previousPage')}><ChevronLeft size={16} /></button><span className="min-w-16 text-center tabular-nums" dir="ltr">{page} / {totalPages}</span><button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200" aria-label={t('companyFinance.suppliers.nextPage')}><ChevronRight size={16} /></button></div></div></footer>}
    </section>
    {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5" role="dialog" aria-modal="true" aria-label={editingSupplier ? t('companyFinance.suppliers.edit') : t('companyFinance.suppliers.add')}><div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-slate-900 sm:max-h-[calc(100vh-2.5rem)]"><header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-700"><div><h3 className="text-base font-bold text-slate-900 dark:text-white">{editingSupplier ? t('companyFinance.suppliers.edit') : t('companyFinance.suppliers.add')}</h3>{editingSupplier && <p className="mt-0.5 font-mono text-xs text-slate-500" dir="ltr">{editingSupplier.supplierCode}</p>}</div></header><div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{validationError && <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{validationError}</p>}<div className="grid gap-3.5 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.name')}<input value={form.name} onChange={(event) => updateForm('name', event.target.value)} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.supplierType')}<select value={form.supplierType} onChange={(event) => updateForm('supplierType', event.target.value as FinanceSupplierType)} className={fieldClass}>{supplierTypes.map((type) => <option key={type} value={type}>{supplierTypeLabel(type)}</option>)}</select></label><label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.serviceCategory')}<input value={form.serviceCategory} onChange={(event) => updateForm('serviceCategory', event.target.value)} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.legalName')}<input value={form.legalName || ''} onChange={(event) => updateForm('legalName', event.target.value)} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.country')}<input value={form.country || ''} onChange={(event) => updateForm('country', event.target.value)} className={fieldClass} /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.email')}<input type="email" value={form.email || ''} onChange={(event) => updateForm('email', event.target.value)} className={fieldClass} dir="ltr" /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.phone')}<input value={form.phoneNumber || ''} onChange={(event) => updateForm('phoneNumber', event.target.value)} className={fieldClass} dir="ltr" /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.taxNumber')}<input value={form.taxId || ''} onChange={(event) => updateForm('taxId', event.target.value)} className={fieldClass} dir="ltr" /></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.status')}<select value={String(form.isActive)} onChange={(event) => updateForm('isActive', event.target.value === 'true')} className={fieldClass}><option value="true">{t('companyFinance.suppliers.active')}</option><option value="false">{t('companyFinance.suppliers.inactive')}</option></select></label><label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.paymentDetails')}<textarea value={form.paymentDetails || ''} onChange={(event) => updateForm('paymentDetails', event.target.value)} rows={2} className={fieldClass} /></label><label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.paymentTerms')}<textarea value={form.paymentTerms || ''} onChange={(event) => updateForm('paymentTerms', event.target.value)} rows={2} className={fieldClass} /></label><label className="sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t('companyFinance.suppliers.notes')}<textarea value={form.notes || ''} onChange={(event) => updateForm('notes', event.target.value)} rows={2} className={fieldClass} /></label></div></div><footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/50"><button type="button" onClick={() => !saving && setModalOpen(false)} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200">{t('common.cancel')}</button><button type="button" onClick={() => void saveSupplier()} disabled={saving} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900">{saving ? t('companyFinance.suppliers.saving') : t('common.save')}</button></footer></div></div>}
  </div>;
};
