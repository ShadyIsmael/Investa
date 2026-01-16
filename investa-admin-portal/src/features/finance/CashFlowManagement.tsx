
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MOCK_CASHFLOW } from '@/mocks/finance';
import { Icon } from '@/components/common/Icons';

export const CashFlowManagement: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cash Flow Management</h2>
        <p className="text-slate-500 text-[13px] font-medium">Monitor inflow/outflow trends and future liquidity projections.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-[14px] font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Icon name="revenue" className="w-4 h-4 text-indigo-600" />
          Monthly Liquidity Trend
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_CASHFLOW}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '11px', fontWeight: 'bold'}} />
              <Bar dataKey="inflow" name="Cash Inflow" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="outflow" name="Cash Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
             <Icon name="revenue" className="w-6 h-6" />
           </div>
           <div>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Net Cash Flow (Q1)</p>
             <p className="text-xl font-bold text-slate-800 mt-0.5">+$42,000.00</p>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
             <Icon name="sparkles" className="w-6 h-6" />
           </div>
           <div>
             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Forecasted Liquidity (May)</p>
             <p className="text-xl font-bold text-slate-800 mt-0.5">$498,500.00</p>
           </div>
        </div>
      </div>
    </div>
  );
};
