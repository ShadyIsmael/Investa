
import React, { useState, useEffect } from 'react';
import { clientService } from '@/services/clientService';
import { MOCK_CLIENTS } from '@/mocks';
import { Icon } from '@/components/common/Icons';

interface ClientsListProps {
  onViewClient?: (id: string | number) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({ onViewClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

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
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 shadow-sm shadow-emerald-500/5">
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          VERIFIED
        </span>
      );
    }
    if (percent > 0) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          PARTIAL
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">
        UNVERIFIED
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Client Portfolio</h2>
          <p className="text-slate-500 text-[13px] font-medium">Manage corporate identities, verification lifecycles, and access status.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-[13px] font-bold transition-all active:scale-95 shadow-sm">
            Reports
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:scale-95">
            <Icon name="briefcase" className="w-4 h-4" />
            Onboard Client
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80 group">
            <Icon name="search" className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search clients by name, ID or email..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-400 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Icon name="settings" className="w-3.5 h-3.5" />
              Columns
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">Export CSV</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-[0.1em]">
                <th className="px-6 py-4">Client Identity</th>
                <th className="px-6 py-4">Reg. Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Verification Score</th>
                <th className="px-6 py-4 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img src={client.avatar} alt="" className="w-10 h-10 rounded-xl bg-slate-100 object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            client.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[13.5px] leading-tight group-hover:text-indigo-600 transition-colors">{client.name}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5 font-medium">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[12px] font-semibold text-slate-600">
                      <div className="flex flex-col">
                        <span>{new Date(client.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Ref: {client.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`
                          px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border tracking-wider
                          ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                          ${client.status === 'Inactive' ? 'bg-slate-50 text-slate-600 border-slate-100' : ''}
                          ${client.status === 'Suspended' ? 'bg-rose-50 text-rose-700 border-rose-100' : ''}
                          ${client.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                        `}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center mb-0.5">
                          {getVerificationBadge(client.verificationPercent)}
                          <span className={`text-[11px] font-bold ${client.verificationPercent === 100 ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {client.verificationPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              client.verificationPercent === 100 ? 'bg-emerald-500' : 
                              client.verificationPercent > 50 ? 'bg-indigo-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${client.verificationPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => onViewClient?.(client.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-[11px] font-bold transition-all shadow-sm shadow-indigo-500/5 group/btn" title="View Portfolio">
                          <Icon name="sparkles" className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                          View
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200" title="Modify Details">
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
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                         <Icon name="search" className="w-8 h-8 text-slate-200" />
                       </div>
                       <p className="text-[14px] font-bold text-slate-800 tracking-tight">No client records found</p>
                       <p className="text-[12px] text-slate-400 mt-1">Try adjusting your search criteria or clear filters.</p>
                       <button onClick={() => setSearchTerm('')} className="mt-4 text-indigo-600 font-bold text-[12px] hover:underline bg-indigo-50 px-4 py-1.5 rounded-full transition-all">Clear Search</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-700">{filteredClients.length}</span> results in ledger
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-[11px] font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-all" disabled>Previous</button>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center border border-indigo-200 rounded-xl bg-indigo-50 text-[11px] font-bold text-indigo-600 shadow-sm">1</button>
              <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-xl bg-white text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all">2</button>
            </div>
            <button className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
