
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common/Icons';
import { api } from '@/services/api';

// ─── Price Plan ───────────────────────────────────────────────────────────────
type BillingPeriod = 'monthly' | 'yearly' | 'one-time';

interface PricePlan {
  id: number;
  name: string;
  credits: number;
  price: number;
  billingPeriod: BillingPeriod;
  isActive: boolean;
}

interface PlanDraft {
  name: string;
  credits: number;
  price: number;
  billingPeriod: BillingPeriod;
  isActive: boolean;
}

const BLANK_DRAFT: PlanDraft = { name: '', credits: 100, price: 199, billingPeriod: 'monthly', isActive: true };

const BILLING_OPTIONS: { value: BillingPeriod; label: string }[] = [
  { value: 'monthly',  label: 'Monthly' },
  { value: 'yearly',   label: 'Yearly' },
  { value: 'one-time', label: 'One-Time' },
];

export const CreditSetup: React.FC = () => {
  const { t } = useTranslation();

  // ─── State ─────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<PricePlan | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<PlanDraft>(BLANK_DRAFT);
  const [saving, setSaving] = useState(false);

  // ─── Load plans on mount ──────────────────────────────────────────────────
  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setApiError(null);
      const data = await api.get<PricePlan[]>('/api/credit-plans/admin');
      setPlans(data ?? []);
    } catch (e: any) {
      setApiError('Failed to load credit plans.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Edit ──────────────────────────────────────────────────────────────────
  const startEdit = (p: PricePlan) => { setEditingId(p.id); setEditDraft({ ...p }); };
  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };
  const saveEdit = async () => {
    if (!editDraft) return;
    try {
      setSaving(true);
      const updated = await api.put<PricePlan>(`/api/credit-plans/${editDraft.id}`, {
        name: editDraft.name,
        credits: editDraft.credits,
        price: editDraft.price,
        billingPeriod: editDraft.billingPeriod,
        isActive: editDraft.isActive,
      });
      setPlans(ps => ps.map(p => p.id === updated.id ? updated : p));
      cancelEdit();
    } catch {
      setApiError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Add ───────────────────────────────────────────────────────────────────
  const startAdd = () => { setNewDraft(BLANK_DRAFT); setIsAdding(true); };
  const cancelAdd = () => setIsAdding(false);
  const confirmAdd = async () => {
    if (!newDraft.name.trim()) return;
    try {
      setSaving(true);
      const created = await api.post<PricePlan>('/api/credit-plans', newDraft);
      setPlans(ps => [...ps, created]);
      setIsAdding(false);
    } catch {
      setApiError('Failed to create plan.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Toggle active ────────────────────────────────────────────────────────
  const toggleActive = async (plan: PricePlan) => {
    try {
      const updated = await api.put<PricePlan>(`/api/credit-plans/${plan.id}`, {
        ...plan,
        isActive: !plan.isActive,
      });
      setPlans(ps => ps.map(p => p.id === updated.id ? updated : p));
    } catch {
      setApiError('Failed to update plan status.');
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const deletePlan = async (id: number) => {
    try {
      await api.delete(`/api/credit-plans/${id}`);
      setPlans(ps => ps.filter(p => p.id !== id));
      setDeletingId(null);
    } catch {
      setApiError('Failed to delete plan.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{t('pages.creditPricingSetup', { defaultValue: 'Credit Pricing Setup' })}</h2>
          <p className="text-muted-foreground text-[13px] font-medium">{t('pages.creditPricingSetupDescription', { defaultValue: 'Configure credit bundles available for purchase.' })}</p>
        </div>
      </div>

      {/* API error banner */}
      {apiError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="text-destructive/60 hover:text-destructive ml-4">✕</button>
        </div>
      )}

      {/* ── Price Plans Section ────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Icon name="credit-card" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Price Plans</h3>
              <p className="text-[12px] text-muted-foreground">Define credit bundles clients can purchase</p>
            </div>
          </div>
          <button
            onClick={startAdd}
            disabled={isAdding}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Plan
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <svg className="animate-spin w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <p className="text-sm font-medium">Loading plans…</p>
            </div>
          )}

          {/* New plan card */}
          {isAdding && (
            <div className="bg-card text-card-foreground rounded-2xl border-2 border-primary/40 border-dashed p-5 space-y-3 shadow-md">
              <p className="text-[11px] font-black uppercase tracking-wider text-primary mb-1">New Plan</p>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Plan Name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Starter"
                  value={newDraft.name}
                  onChange={e => setNewDraft(d => ({ ...d, name: e.target.value }))}
                  className="input-field w-full mt-1 text-sm font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Credits</label>
                  <input
                    type="number" min={1} step={1}
                    value={newDraft.credits}
                    onChange={e => setNewDraft(d => ({ ...d, credits: Number(e.target.value) }))}
                    className="input-field w-full mt-1 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (EGP)</label>
                  <input
                    type="number" min={0} step={1}
                    value={newDraft.price}
                    onChange={e => setNewDraft(d => ({ ...d, price: Number(e.target.value) }))}
                    className="input-field w-full mt-1 text-sm font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Billing Period</label>
                <select
                  value={newDraft.billingPeriod}
                  onChange={e => setNewDraft(d => ({ ...d, billingPeriod: e.target.value as BillingPeriod }))}
                  className="input-field w-full mt-1 text-sm font-semibold bg-card"
                >
                  {BILLING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={cancelAdd} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-bold hover:bg-muted/80 transition-all">Cancel</button>
                <button
                  onClick={confirmAdd}
                  disabled={!newDraft.name.trim() || saving}
                  className="btn-primary flex-1 justify-center py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >{saving ? 'Saving…' : 'Create'}</button>
              </div>
            </div>
          )}

          {/* Existing plan cards */}
          {!loading && plans.map(plan => (
            <div
              key={plan.id}
              className={`card p-5 space-y-3 transition-all ${
                editingId === plan.id ? 'ring-2 ring-primary/20 border-primary/40' : ''
              } ${!plan.isActive && editingId !== plan.id ? 'opacity-60' : ''}`}
            >
              {editingId === plan.id && editDraft ? (
                /* ── Edit mode ── */
                <>
                  <p className="text-[11px] font-black uppercase tracking-wider text-primary">Editing</p>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Plan Name</label>
                    <input
                      autoFocus
                      type="text"
                      value={editDraft.name}
                      onChange={e => setEditDraft(d => d ? { ...d, name: e.target.value } : d)}
                      className="input-field w-full mt-1 text-sm font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Credits</label>
                      <input
                        type="number" min={1} step={1}
                        value={editDraft.credits}
                        onChange={e => setEditDraft(d => d ? { ...d, credits: Number(e.target.value) } : d)}
                        className="input-field w-full mt-1 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (EGP)</label>
                      <input
                        type="number" min={0} step={1}
                        value={editDraft.price}
                        onChange={e => setEditDraft(d => d ? { ...d, price: Number(e.target.value) } : d)}
                        className="input-field w-full mt-1 text-sm font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Billing Period</label>
                    <select
                      value={editDraft.billingPeriod}
                      onChange={e => setEditDraft(d => d ? { ...d, billingPeriod: e.target.value as BillingPeriod } : d)}
                      className="input-field w-full mt-1 text-sm font-semibold bg-card"
                    >
                      {BILLING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={cancelEdit} className="flex-1 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-bold hover:bg-muted/80 transition-all">Cancel</button>
                    <button
                      onClick={saveEdit}
                      disabled={!editDraft.name.trim() || saving}
                      className="btn-primary flex-1 justify-center py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >{saving ? 'Saving…' : 'Save'}</button>
                  </div>
                </>
              ) : (
                /* ── View mode ── */
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-base font-black text-foreground">{plan.name}</h4>
                      <span className="badge mt-1 text-[10px] uppercase tracking-wider">
                        {BILLING_OPTIONS.find(o => o.value === plan.billingPeriod)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(plan)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(plan.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end gap-1 py-2">
                    <span className="text-3xl font-black text-foreground">{plan.price.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground mb-1">EGP</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl">
                    <Icon name="cash" className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">{plan.credits.toLocaleString()} credits</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">{(plan.price / plan.credits).toFixed(2)} EGP / credit</span>
                    <button
                      onClick={() => toggleActive(plan)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        plan.isActive
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  {/* Inline delete confirm */}
                  {deletingId === plan.id && (
                    <div className="pt-2 border-t border-destructive/20 space-y-2">
                      <p className="text-xs font-bold text-destructive">Delete this plan?</p>
                      <div className="flex gap-2">
                        <button onClick={() => setDeletingId(null)} className="flex-1 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-bold hover:bg-muted/80 transition-all">Cancel</button>
                        <button onClick={() => deletePlan(plan.id)} className="flex-1 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 transition-all">Delete</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {!loading && plans.length === 0 && !isAdding && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Icon name="credit-card" className="w-10 h-10 opacity-30" />
              <p className="text-sm font-bold">No plans yet. Click "Add Plan" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
