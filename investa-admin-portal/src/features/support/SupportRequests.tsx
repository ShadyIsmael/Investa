
import React, { useState, useEffect } from 'react';
import { supportService } from '@/services/supportService';
import ChatList from '@/features/support/ChatList';
import ChatConversationsListener from '@/features/support/ChatConversationsListener';
import { SupportRequest } from '@/types';
import { Icon } from '@/components/common/Icons';

const SLATimer: React.FC<{ dueAt: string; status: string }> = ({ dueAt, status }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const isCompleted = ['Resolved', 'Closed'].includes(status);

  useEffect(() => {
    if (isCompleted) return;
    const calculate = () => setTimeLeft(new Date(dueAt).getTime() - new Date().getTime());
    calculate();
    const interval = setInterval(calculate, 60000);
    return () => clearInterval(interval);
  }, [dueAt, isCompleted]);

  if (isCompleted) return <div className="text-emerald-500 font-bold text-[10px] flex items-center gap-1.5"><Icon name="shield-check" className="w-3 h-3"/>SLA MET</div>;

  const hours = Math.floor(Math.abs(timeLeft) / (1000 * 60 * 60));
  const minutes = Math.floor((Math.abs(timeLeft) / (1000 * 60)) % 60);
  const isOverdue = timeLeft < 0;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-black tracking-tight ${isOverdue ? 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse' : 'text-emerald-600 bg-emerald-50 border-emerald-100'}`}>
      <Icon name="activity" className="w-2.5 h-2.5" />
      {isOverdue ? `OVERDUE ${hours}h ${minutes}m` : `${hours}h ${minutes}m left`}
    </div>
  );
};

export const SupportRequests: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await supportService.getTickets();
        setTickets(data);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Listen for real-time support requests from SignalR
    const onSupport = (e: any) => {
      const payload = e?.detail || e;
      console.log('DATA RECEIVED (component):', payload);

      // Map incoming fields to the table model, ensuring nulls are cleaned
      const mapped = {
        id: String(payload?.id || payload?.ticketId || Date.now()),
        clientName: payload?.clientName || payload?.client || `User ${payload?.fromUserId || ''}`,
        subject: payload?.subject || payload?.message || 'New support request',
        priority: (payload?.priority as any) || 'Medium',
        status: (payload?.status as any) || 'Open',
        createdAt: payload?.createdAt || new Date().toISOString(),
        slaDueAt: payload?.slaDueAt || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        conversationId: payload?.conversationId,
        phoneNumber: payload?.phoneNumber,
      } as SupportRequest & { conversationId?: string; phoneNumber?: string };

      // Remove null/undefined entries
      for (const k of Object.keys(mapped)) {
        if ((mapped as any)[k] === null || typeof (mapped as any)[k] === 'undefined') delete (mapped as any)[k];
      }

      setTickets(prev => [mapped as SupportRequest, ...prev]);
    };

    window.addEventListener('investa:signalr:receive-support', onSupport as EventListener);

    return () => {
      window.removeEventListener('investa:signalr:receive-support', onSupport as EventListener);
    };
  }, []);

  const filtered = tickets.filter(req => 
    req.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-[40vh] flex items-center justify-center opacity-50"><Icon name="headset" className="w-10 h-10 animate-spin text-slate-200"/></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Support Infrastructure</h2>
          <p className="text-slate-500 text-[13px] font-medium">Real-time ticket lifecycle management and SLA oversight.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20">
            <Icon name="sparkles" className="w-4 h-4" />
            Neural Dispatch
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="relative w-full sm:w-80 group">
            <Icon name="search" className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Filter by ticket ID or subject..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[13px] font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex">
          {/* Left: Chat list */}
          <div className="w-80 border-r border-slate-100 dark:border-slate-800">
            <div className="p-4">
              <h4 className="text-sm font-bold">Live Chats</h4>
              <p className="text-xs text-slate-500">Assigned conversations</p>
            </div>
            <div>
              {/* ChatList component */}
              <div className="h-[56vh] overflow-y-auto">
                {/* Render ChatList directly here */}
                <div className="p-2"><ChatList /></div>
              </div>
            </div>
          </div>

          {/* Right: existing tickets table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="px-6 py-4"><span className="text-[12px] font-black text-indigo-600">{req.id}</span></td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-[13px] leading-tight">{req.clientName}</p>
                      <SLATimer dueAt={req.slaDueAt} status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[12.5px] font-bold text-slate-700 truncate max-w-[250px]">{req.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">Resolve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
