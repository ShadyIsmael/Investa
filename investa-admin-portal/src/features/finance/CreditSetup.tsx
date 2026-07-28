import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Icon } from '@/components/common/Icons';
import { api } from '@/services/api';

type PackageId = string | number;
type PurchaseStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled' | 'Expired' | 'Refunded';

interface CreditPackage {
  id: PackageId;
  code: string;
  nameEn: string;
  nameAr: string;
  creditQuantity: number;
  sellingPrice: number;
  currency: string;
  bonusCredits: number;
  activeFrom: string | null;
  activeTo: string | null;
  isActive: boolean;
  displayOrder: number;
  isFeatured: boolean;
  updatedAt?: string | null;
}

interface PackageDraft extends Omit<CreditPackage, 'id' | 'updatedAt'> {}

interface CreditPurchase {
  id: PackageId;
  userId: string;
  userDisplayName?: string | null;
  userEmail?: string | null;
  packageCode: string;
  packageName: string;
  purchasedCredits: number;
  bonusCredits: number;
  totalPrice: number;
  currency: string;
  status: PurchaseStatus;
  providerReference?: string | null;
  walletTransactionId?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

const EMPTY_PACKAGE: PackageDraft = {
  code: '', nameEn: '', nameAr: '', creditQuantity: 100, sellingPrice: 0, currency: 'EGP',
  bonusCredits: 0, activeFrom: null, activeTo: null, isActive: true, displayOrder: 0, isFeatured: false,
};

const unwrapList = (value: any): any[] => {
  const list = value?.data?.items ?? value?.data ?? value?.items ?? value;
  return Array.isArray(list) ? list : [];
};

const mapPackage = (value: any): CreditPackage => ({
  id: value.id ?? value.Id,
  code: String(value.code ?? value.Code ?? ''),
  nameEn: String(value.nameEn ?? value.NameEn ?? value.name ?? value.Name ?? ''),
  nameAr: String(value.nameAr ?? value.NameAr ?? ''),
  creditQuantity: Number(value.creditQuantity ?? value.CreditQuantity ?? value.credits ?? value.Credits ?? 0),
  sellingPrice: Number(value.sellingPrice ?? value.SellingPrice ?? value.price ?? value.Price ?? 0),
  currency: String(value.currency ?? value.Currency ?? ''),
  bonusCredits: Number(value.bonusCredits ?? value.BonusCredits ?? 0),
  activeFrom: value.activeFrom ?? value.ActiveFrom ?? null,
  activeTo: value.activeTo ?? value.ActiveTo ?? value.activeUntil ?? value.ActiveUntil ?? null,
  isActive: Boolean(value.isActive ?? value.IsActive),
  displayOrder: Number(value.displayOrder ?? value.DisplayOrder ?? 0),
  isFeatured: Boolean(value.isFeatured ?? value.IsFeatured),
  updatedAt: value.updatedAt ?? value.UpdatedAt ?? null,
});

const mapPurchase = (source: any): CreditPurchase => {
  const value = source.order ?? source.Order ?? source;
  return ({
  id: value.id ?? value.Id,
  userId: String(source.userId ?? source.UserId ?? value.userId ?? value.UserId ?? ''),
  userDisplayName: value.userDisplayName ?? value.UserDisplayName ?? null,
  userEmail: value.userEmail ?? value.UserEmail ?? null,
  packageCode: String(value.packageCode ?? value.PackageCode ?? value.planCode ?? value.PlanCode ?? ''),
  packageName: String(value.packageName ?? value.PackageName ?? value.planName ?? value.PlanName ?? ''),
  purchasedCredits: Number(value.purchasedCredits ?? value.PurchasedCredits ?? value.credits ?? value.Credits ?? 0),
  bonusCredits: Number(value.bonusCredits ?? value.BonusCredits ?? 0),
  totalPrice: Number(value.totalPrice ?? value.TotalPrice ?? value.pricePaid ?? value.PricePaid ?? 0),
  currency: String(value.currency ?? value.Currency ?? ''),
  status: (value.status ?? value.Status ?? value.paymentStatus ?? value.PaymentStatus ?? 'Pending') as PurchaseStatus,
  providerReference: value.providerReference ?? value.ProviderReference ?? null,
  walletTransactionId: value.walletTransactionId ?? value.WalletTransactionId ?? null,
  createdAt: value.createdAt ?? value.CreatedAt ?? '',
  paidAt: value.paidAt ?? value.PaidAt ?? null,
  });
};

const dateInput = (value: string | null) => value ? value.slice(0, 10) : '';
const dateLabel = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
const money = (value: number, currency: string) => {
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value); }
  catch { return `${value.toLocaleString()} ${currency}`; }
};

export const CreditSetup: React.FC = () => {
  const { t, i18n } = useTranslation();
  const rtl = i18n.dir() === 'rtl';
  const [tab, setTab] = useState<'packages' | 'orders'>('packages');
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [orders, setOrders] = useState<CreditPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<CreditPackage | null>(null);
  const [draft, setDraft] = useState<PackageDraft>(EMPTY_PACKAGE);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<any>('/api/credit-plans/admin');
      setPackages(unwrapList(result).map(mapPackage).sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (error: any) { toast.error(error?.message ?? t('creditAdmin.loadPackagesError')); }
    finally { setLoading(false); }
  }, [t]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<any>('/api/credit-plans/admin/orders');
      let rows = unwrapList(result).map(mapPurchase);
      const queryText = search.trim().toLowerCase();
      if (queryText) rows = rows.filter(order => [order.id, order.userId, order.packageCode, order.packageName, order.providerReference].some(value => String(value ?? '').toLowerCase().includes(queryText)));
      if (status) rows = rows.filter(order => order.status === status);
      setOrders(rows);
    } catch (error: any) { toast.error(error?.message ?? t('creditAdmin.loadOrdersError')); }
    finally { setLoading(false); }
  }, [search, status, t]);

  useEffect(() => { tab === 'packages' ? loadPackages() : loadOrders(); }, [tab, loadPackages, loadOrders]);

  const openCreate = () => { setEditing(null); setDraft({ ...EMPTY_PACKAGE }); setShowForm(true); };
  const openEdit = (item: CreditPackage) => {
    const { id: _id, updatedAt: _updatedAt, ...values } = item;
    setEditing(item); setDraft(values); setShowForm(true);
  };

  const valid = useMemo(() => draft.code.trim() && draft.nameEn.trim() && draft.nameAr.trim()
    && draft.creditQuantity > 0 && draft.sellingPrice > 0 && /^[A-Z]{3}$/.test(draft.currency.trim().toUpperCase())
    && draft.bonusCredits >= 0 && (!draft.activeFrom || !draft.activeTo || draft.activeFrom <= draft.activeTo), [draft]);

  const savePackage = async () => {
    if (!valid || saving) return;
    setSaving(true);
    const payload = {
      code: draft.code.trim(), name: draft.nameEn.trim(), nameAr: draft.nameAr.trim(),
      credits: draft.creditQuantity, bonusCredits: draft.bonusCredits, price: draft.sellingPrice,
      currency: draft.currency.trim().toUpperCase(), activeFrom: draft.activeFrom,
      activeUntil: draft.activeTo, displayOrder: draft.displayOrder, isFeatured: draft.isFeatured,
      billingPeriod: 'one-time', isActive: draft.isActive,
    };
    try {
      if (editing) await api.put(`/api/credit-plans/${editing.id}`, payload);
      else await api.post('/api/credit-plans', payload);
      toast.success(t(editing ? 'creditAdmin.updated' : 'creditAdmin.created'));
      setShowForm(false); await loadPackages();
    } catch (error: any) { toast.error(error?.message ?? t('creditAdmin.saveError')); }
    finally { setSaving(false); }
  };

  const setPackageActive = async (item: CreditPackage, isActive: boolean) => {
    try {
      await api.put(`/api/credit-plans/${item.id}`, {
        code: item.code, name: item.nameEn, nameAr: item.nameAr, credits: item.creditQuantity,
        bonusCredits: item.bonusCredits, price: item.sellingPrice, currency: item.currency,
        activeFrom: item.activeFrom, activeUntil: item.activeTo, displayOrder: item.displayOrder,
        isFeatured: item.isFeatured, billingPeriod: 'one-time', isActive,
      });
      toast.success(t(isActive ? 'creditAdmin.activated' : 'creditAdmin.deactivated'));
      await loadPackages();
    } catch (error: any) { toast.error(error?.message ?? t('creditAdmin.statusError')); }
  };

  return (
    <div className="space-y-6" dir={rtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('creditAdmin.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('creditAdmin.description')}</p>
        </div>
        {tab === 'packages' && <button className="btn-primary" onClick={openCreate}><span aria-hidden>+</span>{t('creditAdmin.addPackage')}</button>}
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['packages', 'orders'] as const).map(value => <button key={value} onClick={() => setTab(value)} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab === value ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>{t(`creditAdmin.${value}`)}</button>)}
      </div>

      {tab === 'packages' ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-sm">
              <thead className="bg-muted/60 text-muted-foreground"><tr>
                {['code','name','credits','bonus','price','activeDates','displayOrder','status','actions'].map(key => <th key={key} className="px-4 py-3 text-start font-bold">{t(`creditAdmin.${key}`)}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {loading ? <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">{t('common.loading')}</td></tr> : packages.map(item => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                    <td className="px-4 py-3"><div className="font-bold text-foreground">{i18n.language.startsWith('ar') ? item.nameAr : item.nameEn}</div>{item.isFeatured && <span className="text-xs text-primary">{t('creditAdmin.featured')}</span>}</td>
                    <td className="px-4 py-3 font-bold">{item.creditQuantity.toLocaleString()}</td>
                    <td className="px-4 py-3">{item.bonusCredits.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">{money(item.sellingPrice, item.currency)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{dateInput(item.activeFrom) || t('creditAdmin.immediate')} – {dateInput(item.activeTo) || t('creditAdmin.noEnd')}</td>
                    <td className="px-4 py-3">{item.displayOrder}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>{t(item.isActive ? 'creditAdmin.active' : 'creditAdmin.inactive')}</span></td>
                    <td className="px-4 py-3"><div className="flex gap-2"><button className="rounded-lg px-3 py-1.5 font-bold text-primary hover:bg-primary/10" onClick={() => openEdit(item)}>{t('common.edit')}</button><button className={`rounded-lg px-3 py-1.5 font-bold ${item.isActive ? 'text-destructive hover:bg-destructive/10' : 'text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/30'}`} onClick={() => setPackageActive(item, !item.isActive)}>{t(item.isActive ? 'creditAdmin.deactivate' : 'creditAdmin.activate')}</button></div></td>
                  </tr>
                ))}
                {!loading && packages.length === 0 && <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">{t('creditAdmin.noPackages')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_220px_auto]">
            <input className="input-field" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('creditAdmin.searchOrders')} />
            <select className="input-field bg-card" value={status} onChange={e => setStatus(e.target.value)}><option value="">{t('creditAdmin.allStatuses')}</option>{['Pending','Processing','Paid','Failed','Cancelled','Expired','Refunded'].map(value => <option key={value}>{value}</option>)}</select>
            <button className="btn-primary" onClick={loadOrders}><Icon name="search" className="h-4 w-4" />{t('common.search')}</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-muted/60 text-muted-foreground"><tr>{['orderId','customer','package','credits','price','paymentStatus','providerReference','walletTransaction','createdAt'].map(key => <th key={key} className="px-4 py-3 text-start font-bold">{t(`creditAdmin.${key}`)}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">{loading ? <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">{t('common.loading')}</td></tr> : orders.map(order => <tr key={order.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-mono text-xs">{order.id}</td><td className="px-4 py-3"><div className="font-bold">{order.userDisplayName || order.userEmail || order.userId}</div>{order.userEmail && <div className="text-xs text-muted-foreground">{order.userEmail}</div>}</td>
              <td className="px-4 py-3"><div className="font-bold">{order.packageName}</div><div className="font-mono text-xs text-muted-foreground">{order.packageCode}</div></td><td className="px-4 py-3">{order.purchasedCredits.toLocaleString()}{order.bonusCredits > 0 && <span className="text-emerald-600"> +{order.bonusCredits}</span>}</td><td className="px-4 py-3 font-bold">{money(order.totalPrice, order.currency)}</td>
              <td className="px-4 py-3"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{t(`creditAdmin.statuses.${order.status}`)}</span></td><td className="px-4 py-3 font-mono text-xs">{order.providerReference || '-'}</td><td className="px-4 py-3 font-mono text-xs">{order.walletTransactionId || t('creditAdmin.notCredited')}</td><td className="px-4 py-3 text-xs">{dateLabel(order.createdAt)}</td>
            </tr>)}{!loading && orders.length === 0 && <tr><td colSpan={9} className="p-12 text-center text-muted-foreground">{t('creditAdmin.noOrders')}</td></tr>}</tbody>
          </table></div></div>
          <p className="text-xs text-muted-foreground">{t('creditAdmin.paymentReadOnlyNotice')}</p>
        </div>
      )}

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between"><h3 className="text-xl font-bold">{t(editing ? 'creditAdmin.editPackage' : 'creditAdmin.addPackage')}</h3><button onClick={() => setShowForm(false)} className="text-muted-foreground">✕</button></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('creditAdmin.code')}><input className="input-field w-full" value={draft.code} disabled={!!editing} onChange={e => setDraft({ ...draft, code: e.target.value })} /></Field>
          <Field label={t('creditAdmin.currency')}><input className="input-field w-full" maxLength={3} value={draft.currency} onChange={e => setDraft({ ...draft, currency: e.target.value.toUpperCase() })} /></Field>
          <Field label={t('creditAdmin.nameEn')}><input className="input-field w-full" dir="ltr" value={draft.nameEn} onChange={e => setDraft({ ...draft, nameEn: e.target.value })} /></Field>
          <Field label={t('creditAdmin.nameAr')}><input className="input-field w-full" dir="rtl" value={draft.nameAr} onChange={e => setDraft({ ...draft, nameAr: e.target.value })} /></Field>
          <NumberField label={t('creditAdmin.credits')} value={draft.creditQuantity} min={1} onChange={creditQuantity => setDraft({ ...draft, creditQuantity })} />
          <NumberField label={t('creditAdmin.bonus')} value={draft.bonusCredits} min={0} onChange={bonusCredits => setDraft({ ...draft, bonusCredits })} />
          <NumberField label={t('creditAdmin.price')} value={draft.sellingPrice} min={0} step="0.01" onChange={sellingPrice => setDraft({ ...draft, sellingPrice })} />
          <NumberField label={t('creditAdmin.displayOrder')} value={draft.displayOrder} min={0} onChange={displayOrder => setDraft({ ...draft, displayOrder })} />
          <Field label={t('creditAdmin.activeFrom')}><input type="date" className="input-field w-full" value={dateInput(draft.activeFrom)} onChange={e => setDraft({ ...draft, activeFrom: e.target.value || null })} /></Field>
          <Field label={t('creditAdmin.activeTo')}><input type="date" className="input-field w-full" value={dateInput(draft.activeTo)} onChange={e => setDraft({ ...draft, activeTo: e.target.value || null })} /></Field>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isActive} onChange={e => setDraft({ ...draft, isActive: e.target.checked })} />{t('creditAdmin.active')}</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isFeatured} onChange={e => setDraft({ ...draft, isFeatured: e.target.checked })} />{t('creditAdmin.featured')}</label>
        </div>
        {!valid && <p className="mt-4 text-xs text-destructive">{t('creditAdmin.validation')}</p>}
        <div className="mt-6 flex justify-end gap-3"><button className="rounded-lg bg-muted px-4 py-2 font-bold" onClick={() => setShowForm(false)}>{t('common.cancel')}</button><button className="btn-primary" disabled={!valid || saving} onClick={savePackage}>{saving ? t('common.loading') : t('common.save')}</button></div>
      </div></div>}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block"><span className="mb-1 block text-xs font-bold text-muted-foreground">{label}</span>{children}</label>;
const NumberField = ({ label, value, min, step = '1', onChange }: { label: string; value: number; min: number; step?: string; onChange: (value: number) => void }) => <Field label={label}><input type="number" min={min} step={step} className="input-field w-full" value={value} onChange={e => onChange(Number(e.target.value))} /></Field>;
