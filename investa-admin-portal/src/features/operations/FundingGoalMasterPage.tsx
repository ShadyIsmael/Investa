import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { usePermissions } from '@/context/AuthContext';
import { FinanceEmpty, FinanceError, FinanceLoading } from '@/features/company-finance/CompanyFinanceStates';
import { fundingGoalAdminService, FundingGoalAdminInput, FundingGoalAdminItem } from '@/services/fundingGoalAdminService';

const emptyForm: FundingGoalAdminInput = { nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', sortOrder: 0 };

const FundingGoalMasterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { hasAnyPermission } = usePermissions();
  const canManage = hasAnyPermission('User.Manage', 'System.Configure');
  const [items, setItems] = useState<FundingGoalAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FundingGoalAdminItem | null>(null);
  const [form, setForm] = useState<FundingGoalAdminInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await fundingGoalAdminService.list(search, status)); }
    catch (e: any) { const message = e?.message ?? t('fundingGoalMaster.loadError'); setError(message); toast.error(message); }
    finally { setLoading(false); }
  }, [search, status, t]);

  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.nameEn.localeCompare(b.nameEn)), [items]);
  const update = <K extends keyof FundingGoalAdminInput>(key: K, value: FundingGoalAdminInput[K]) => setForm(current => ({ ...current, [key]: value }));
  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (item: FundingGoalAdminItem) => { setEditing(item); setForm({ nameEn: item.nameEn, nameAr: item.nameAr, descriptionEn: item.descriptionEn ?? '', descriptionAr: item.descriptionAr ?? '', sortOrder: item.sortOrder }); setModalOpen(true); };
  const save = async () => {
    if (saving) return;
    if (!form.nameEn.trim() || !form.nameAr.trim()) { toast.error(t('fundingGoalMaster.validation')); return; }
    setSaving(true);
    try {
      const input = { ...form, nameEn: form.nameEn.trim(), nameAr: form.nameAr.trim(), descriptionEn: form.descriptionEn?.trim() || undefined, descriptionAr: form.descriptionAr?.trim() || undefined, sortOrder: Number(form.sortOrder) || 0 };
      if (editing) await fundingGoalAdminService.update(editing.id, input); else await fundingGoalAdminService.create(input);
      toast.success(t(editing ? 'fundingGoalMaster.updated' : 'fundingGoalMaster.created')); setModalOpen(false); await load();
    } catch (e: any) { toast.error(e?.message ?? t('fundingGoalMaster.saveError')); }
    finally { setSaving(false); }
  };
  const toggle = async (item: FundingGoalAdminItem) => {
    if (!canManage) return;
    const warning = item.referenceCount ? ` ${t('fundingGoalMaster.referenceWarning', { count: item.referenceCount })}` : '';
    if (!window.confirm(`${t(item.isActive ? 'fundingGoalMaster.deactivate' : 'fundingGoalMaster.activate')} ${item.nameEn}?${warning}`)) return;
    try { await fundingGoalAdminService.setActive(item.id, !item.isActive); toast.success(t(item.isActive ? 'fundingGoalMaster.deactivated' : 'fundingGoalMaster.activated')); await load(); }
    catch (e: any) { toast.error(e?.message ?? t('fundingGoalMaster.statusError')); }
  };

  return <div className="space-y-5 p-4 sm:p-6" dir={i18n.dir()}>
    <header className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-bold text-foreground">{t('fundingGoalMaster.title')}</h1><p className="mt-1 text-sm text-muted-foreground">{t('fundingGoalMaster.description')}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />{t('common.refresh')}</button>{canManage && <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"><Plus size={16} />{t('fundingGoalMaster.add')}</button>}</div></header>
    <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_180px_auto]"><label className="relative"><Search size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('fundingGoalMaster.search')} className="input-field w-full ps-9" /></label><select value={status} onChange={e => setStatus(e.target.value)} className="input-field"><option value="">{t('fundingGoalMaster.allStatuses')}</option><option value="true">{t('fundingGoalMaster.active')}</option><option value="false">{t('fundingGoalMaster.inactive')}</option></select><button type="button" onClick={() => { setSearch(''); setStatus(''); }} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">{t('fundingGoalMaster.reset')}</button></div>
    {error ? <FinanceError message={error} /> : loading ? <FinanceLoading /> : <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[980px] w-full text-sm"><thead className="bg-muted/60 text-muted-foreground"><tr>{['code','names','description','sortOrder','status','references','actions'].map(key => <th key={key} className="px-4 py-3 text-start font-bold">{t(`fundingGoalMaster.${key}`)}</th>)}</tr></thead><tbody className="divide-y divide-border">{visible.map(item => <tr key={item.id} className="hover:bg-muted/30"><td className="px-4 py-3 font-mono font-bold" dir="ltr">{item.code}</td><td className="px-4 py-3"><div className="font-semibold">{item.nameEn}</div><div className="text-muted-foreground" dir="rtl">{item.nameAr}</div></td><td className="max-w-[240px] truncate px-4 py-3 text-sm text-muted-foreground" title={item.descriptionEn ?? ''}>{item.descriptionEn || '-'}</td><td className="px-4 py-3" dir="ltr">{item.sortOrder}</td><td className="px-4 py-3"><Status active={item.isActive} t={t} /></td><td className="px-4 py-3" dir="ltr">{item.referenceCount}</td><td className="px-4 py-3">{canManage && <div className="flex gap-2"><button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-primary hover:bg-primary/10"><Pencil size={14} />{t('common.edit')}</button><button type="button" onClick={() => void toggle(item)} className="rounded-md px-2 py-1 font-semibold text-primary hover:bg-primary/10">{t(item.isActive ? 'fundingGoalMaster.deactivate' : 'fundingGoalMaster.activate')}</button></div>}</td></tr>)}{visible.length === 0 && <tr><td colSpan={7}><FinanceEmpty /></td></tr>}</tbody></table></div></div>}
    {modalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5" role="dialog" aria-modal="true"><div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl"><header className="border-b border-border px-5 py-4"><h2 className="text-lg font-bold">{t(editing ? 'fundingGoalMaster.edit' : 'fundingGoalMaster.add')}</h2></header><div className="min-h-0 flex-1 overflow-y-auto p-5"><div className="grid gap-4 sm:grid-cols-2"><Field label={t('fundingGoalMaster.code')}><input value={editing?.code ?? t('fundingGoalMaster.generated')} disabled className="input-field w-full bg-muted" dir="ltr" /></Field><Field label={t('fundingGoalMaster.nameEn')}><input value={form.nameEn} onChange={e => update('nameEn', e.target.value)} className="input-field w-full" dir="ltr" /></Field><Field label={t('fundingGoalMaster.nameAr')}><input value={form.nameAr} onChange={e => update('nameAr', e.target.value)} className="input-field w-full" dir="rtl" /></Field><Field label={t('fundingGoalMaster.descriptionEn')}><textarea value={form.descriptionEn ?? ''} onChange={e => update('descriptionEn', e.target.value)} className="input-field w-full" dir="ltr" rows={3} /></Field><Field label={t('fundingGoalMaster.descriptionAr')}><textarea value={form.descriptionAr ?? ''} onChange={e => update('descriptionAr', e.target.value)} className="input-field w-full" dir="rtl" rows={3} /></Field><Field label={t('fundingGoalMaster.sortOrder')}><input type="number" min={0} value={form.sortOrder} onChange={e => update('sortOrder', Number(e.target.value))} className="input-field w-full" dir="ltr" /></Field></div></div><footer className="flex justify-end gap-3 border-t border-border px-5 py-4"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold">{t('common.cancel')}</button><button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? t('common.loading') : t('common.save')}</button></footer></div></div>}
  </div>;
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block text-sm font-medium text-foreground">{label}<span className="mt-1 block">{children}</span></label>;
const Status: React.FC<{ active: boolean; t: (key: string, options?: any) => string }> = ({ active, t }) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{t(active ? 'fundingGoalMaster.active' : 'fundingGoalMaster.inactive')}</span>;

export default FundingGoalMasterPage;
