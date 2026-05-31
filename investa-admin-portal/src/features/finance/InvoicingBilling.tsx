
import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_INVOICES } from '@/mocks/finance';
import { Icon } from '@/components/common/Icons';

export const InvoicingBilling: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Overdue'>('All');

  const filtered = useMemo(() => MOCK_INVOICES.filter(inv => filter === 'All' || inv.status === filter), [filter]);
  const outstanding = useMemo(() => MOCK_INVOICES.filter(inv => inv.status !== 'Paid').reduce((s, i) => s + i.amount, 0), []);

  const handleSetFilter = useCallback((f: 'All' | 'Paid' | 'Unpaid' | 'Overdue') => setFilter(f), []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('pages.invoicingBilling', { defaultValue: 'Invoicing & Billing' })}</h2>
          <p className="text-slate-500 text-[13px] font-medium">{t('pages.invoicingBillingDescription', { defaultValue: 'Issue and track professional invoices for your clients.' })}</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20">
          <Icon name="credit-card" className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Outstanding</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">${outstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Paid This Month</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">$15,400.00</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Overdue Count</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">1</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-2">
          {['All', 'Paid', 'Unpaid', 'Overdue'].map(f => (
            <button 
              key={f}
              onClick={() => handleSetFilter(f as any)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-[12px] font-bold text-indigo-600">{inv.id}</td>
                  <td className="px-6 py-4 text-[13px] font-bold text-slate-800">{inv.clientName}</td>
                  <td className="px-6 py-4 text-[13px] font-bold">${inv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-[12px] text-slate-500">{inv.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      inv.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                     <button className="text-slate-400 hover:text-indigo-600"><Icon name="grid" className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

(InvoicingBilling as unknown as React.FC).displayName = 'InvoicingBilling';
