
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MOCK_JOURNALS } from '@/mocks/finance';
import { Icon } from '@/components/common/Icons';

export const JournalEntries: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('pages.journalEntries', { defaultValue: 'Journal Entries' })}</h2>
          <p className="text-slate-500 text-[13px] font-medium">{t('pages.journalEntriesDescription', { defaultValue: 'Auto-synced ledger records for all system transactions.' })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4 text-right">Debit</th>
                <th className="px-6 py-4 text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_JOURNALS.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 text-[12px] text-slate-500 font-medium">{entry.date}</td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-bold text-slate-800">{entry.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Ref: {entry.id}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-slate-600 font-medium">{entry.account}</td>
                  <td className="px-6 py-4 text-right text-[13px] font-bold text-emerald-600">
                    {entry.debit > 0 ? `$${entry.debit.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-bold text-rose-600">
                    {entry.credit > 0 ? `$${entry.credit.toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
