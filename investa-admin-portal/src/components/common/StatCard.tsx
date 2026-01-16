
import React from 'react';
import { DashboardStat } from '@/types';
import { Icon } from '@/components/common/Icons';

interface StatCardProps {
  stat: DashboardStat;
}

export const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className={`
          p-2.5 rounded-lg transition-transform group-hover:scale-105
          ${stat.iconName === 'users' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
          ${stat.iconName === 'revenue' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : ''}
          ${stat.iconName === 'activity' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : ''}
          ${stat.iconName === 'orders' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : ''}
        `}>
          <Icon name={stat.iconName} className="w-5 h-5" />
        </div>
        <span className={`
          flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md
          ${stat.trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700'}
        `}>
          {stat.trend === 'up' ? '↑' : '↓'} {Math.abs(stat.change)}%
        </span>
      </div>
      <div>
        <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">{stat.label}</p>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{stat.value}</h3>
      </div>
    </div>
  );
};
