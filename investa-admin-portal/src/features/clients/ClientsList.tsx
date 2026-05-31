
import React, { useState, useEffect } from 'react';
import { clientService } from '@/services/clientService';
import { MOCK_CLIENTS } from '@/mocks';
import { Icon } from '@/components/common/Icons';
import { useTranslation } from 'react-i18next';

interface ClientsListProps {
  onViewClient?: (id: string | number) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({ onViewClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { t } = useTranslation();
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await clientService.getClients();
        if (mounted && Array.isArray(res)) setClients(res);
      } catch (e) {
        console.error('ClientsList load error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(client.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVerificationBadge = (percent: number) => {
    if (percent === 100) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xxs font-bold border border-emerald-200 shadow-sm shadow-emerald-500/5 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          VERIFIED
        </span>
      );
    }
    if (percent > 0) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xxs font-bold border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          PARTIAL
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xxs font-bold border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
        UNVERIFIED
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text tracking-tight">{t('pages.clientPortfolio', { defaultValue: 'Client Portfolio' })}</h2>
          <p className="text-muted-foreground text-sm font-medium">{t('pages.clientPortfolioDescription', { defaultValue: 'Manage corporate identities, verification lifecycles, and access status.' })}</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface hover:bg-background text-muted-foreground border border-border px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm">
            Reports
          </button>
          <button className="bg-primary hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95">
            <Icon name="briefcase" className="w-4 h-4" />
            Onboard Client
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-border bg-background/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80 group">
            <Icon name="search" className="absolute left-3.5 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-muted-foreground shadow-sm text-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-background transition-colors flex items-center justify-center gap-2">
              <Icon name="settings" className="w-3.5 h-3.5" />
              Columns
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-background transition-colors">Export CSV</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface text-text text-xs uppercase tracking-[0.15em] font-semibold">
                <th className="px-6 py-4">Client Identity</th>
                <th className="px-6 py-4">Reg. Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification Score</th>
                <th className="px-6 py-4 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-background/40 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={client.avatar} alt="" className="w-10 h-10 rounded-xl bg-background object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                            client.status === 'Active' ? 'bg-emerald-500' : 'bg-muted'
                          }`} />
                        </div>
                        <div>
                          <p className="font-bold text-text text-sm leading-tight group-hover:text-primary transition-colors">{client.name}</p>
                          <p className="text-muted-foreground text-xxs mt-0.5 font-medium">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-text">{new Date(client.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-xxs text-muted-foreground/70 font-medium">Ref: {client.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`
                          px-2 py-0.5 rounded-lg text-xxs font-black uppercase border tracking-wider
                          ${client.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : ''}
                          ${client.status === 'Inactive' ? 'bg-background text-muted-foreground border-border' : ''}
                          ${client.status === 'Suspended' ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : ''}
                          ${client.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : ''}
                        `}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                          {getVerificationBadge(client.verificationPercent)}
                          <span className={`text-xxs font-bold ${client.verificationPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                            {client.verificationPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              client.verificationPercent === 100 ? 'bg-emerald-500' : 
                              client.verificationPercent > 50 ? 'bg-primary' : 'bg-amber-500'
                            }`}
                            style={{ width: `${client.verificationPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => onViewClient?.(client.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl text-xxs font-black uppercase tracking-wider transition-all shadow-sm shadow-primary/5 group/btn" title="View Portfolio">
                          <Icon name="sparkles" className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                          View
                        </button>
                        <button className="p-1.5 text-muted-foreground hover:text-text hover:bg-background rounded-xl transition-all border border-transparent hover:border-border" title="Modify Details">
                          <Icon name="settings" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                       <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 border border-border">
                         <Icon name="search" className="w-8 h-8 text-muted-foreground" />
                       </div>
                       <p className="text-base font-bold text-text tracking-tight">No client records found</p>
                       <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria or clear filters.</p>
                       <button onClick={() => setSearchTerm('')} className="mt-4 text-primary font-bold text-xs hover:underline bg-primary/10 px-4 py-2 rounded-full transition-all tracking-wide uppercase">Clear Search</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="bg-background/20 px-6 py-4 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
          <span className="text-xxs font-black text-muted-foreground uppercase tracking-widest">
            Showing <span className="text-text">{filteredClients.length}</span> results in ledger
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-border rounded-xl bg-surface text-xxs font-black text-muted-foreground disabled:opacity-30 hover:bg-background transition-all uppercase tracking-wider" disabled>Previous</button>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center border border-primary/20 rounded-xl bg-primary/10 text-xxs font-black text-primary shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center border border-border rounded-xl bg-surface text-xxs font-black text-muted-foreground hover:bg-background transition-all">2</button>
            </div>
            <button className="px-4 py-2 border border-border rounded-xl bg-surface text-xxs font-black text-muted-foreground hover:bg-background transition-all uppercase tracking-wider">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
