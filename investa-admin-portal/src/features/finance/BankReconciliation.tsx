
import React from 'react';
import { Icon } from '@/components/common/Icons';

export const BankReconciliation: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bank Reconciliation</h2>
          <p className="text-slate-500 text-[13px] font-medium">Upload statements and verify internal ledger accuracy.</p>
        </div>
        <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
          <Icon name="grid" className="w-4 h-4" />
          Upload Statement
        </button>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
          <Icon name="shield-check" className="w-8 h-8" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-[15px] font-bold text-indigo-900">Last Recon: 2 days ago</h3>
          <p className="text-indigo-700/70 text-[13px] font-medium mt-1">98.5% of records matched automatically. 2 transactions require manual review.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[13px] font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
          Start Reconciliation
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <div className="max-w-xs mx-auto opacity-40">
           <Icon name="headset" className="w-12 h-12 mx-auto mb-4 text-slate-300" />
           <p className="text-[13px] font-medium text-slate-600">Pending transactions list will appear here once a statement is active.</p>
        </div>
      </div>
    </div>
  );
};
