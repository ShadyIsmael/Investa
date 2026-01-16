
import React, { useState, useMemo } from 'react';
import { MOCK_COA } from '@/mocks/finance';
import { Icon } from '@/components/common/Icons';
import { Account } from '@/types';

export const ChartOfAccounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<string>('All');

  const filteredAccounts = useMemo(() => {
    return MOCK_COA.filter(acc => {
      const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.code.includes(searchTerm);
      const matchesType = activeType === 'All' || acc.type === activeType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, activeType]);

  const totalBalance = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  const getAccountTypeStyles = (type: Account['type']) => {
    switch (type) {
      case 'Asset': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Liability': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Equity': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Revenue': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Expense': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Chart of Accounts</h2>
          <p className="text-slate-500 text-[13px] font-medium">Define and manage the financial structure of the organization.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:scale-95">
            <Icon name="grid" className="w-4 h-4" />
            New Account
          </button>
        </div>
      </div>

      {/* Quick Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Accounts</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{MOCK_COA.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Filtered Balance</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">${totalBalance.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
              <p className="text-sm font-bold text-emerald-600 mt-1">Operational</p>
           </div>
           <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
             <Icon name="shield-check" className="w-5 h-5 text-emerald-600" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Icon name="search" className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search by code or account name..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
              {['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    activeType === type 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 w-full lg:w-auto">
            <button className="flex-1 lg:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Icon name="settings" className="w-3.5 h-3.5" />
              Hierarchy View
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-[0.1em]">
                <th className="px-6 py-4">Account Code</th>
                <th className="px-6 py-4">Account Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Current Balance</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4">
                      <span className="text-[12px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors">
                        {acc.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-[13.5px] leading-tight">{acc.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border tracking-wider ${getAccountTypeStyles(acc.type)}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`text-[13px] font-bold ${acc.type === 'Revenue' || acc.type === 'Asset' ? 'text-slate-800' : 'text-rose-600'}`}>
                        ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`w-2 h-2 rounded-full inline-block ${acc.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100">
                          <Icon name="activity" className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200">
                          <Icon name="settings" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                       <Icon name="search" className="w-10 h-10 mb-2 text-slate-300" />
                       <p className="text-[13px] font-medium italic">No ledger accounts match your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>{filteredAccounts.length} Accounts Found</span>
          <div className="flex gap-2">
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors">Export to PDF</button>
            <span className="text-slate-200">|</span>
            <button className="text-indigo-600 hover:text-indigo-800 transition-colors">Export to CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};
