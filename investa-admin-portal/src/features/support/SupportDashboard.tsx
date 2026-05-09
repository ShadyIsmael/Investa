import React, { useState, useEffect } from 'react';
import { useSignalR } from '../../services/signalr';
import { supportService } from '../../services/supportService';

type ChatItem = {
  id: string;
  name: string;
  phone: string;
  category: string;
  startedAt: string; // ISO
  unread: number;
  lastMessage?: string;
};

type TicketItem = {
  id: string;
  name: string;
  phone: string;
  type: string;
  slaLeft: string; // human readable
  status: 'Open' | 'Pending' | 'Resolved';
  details?: string;
};

const MOCK_CHATS: ChatItem[] = [
  { id: 'c1', name: 'Jane Doe', phone: '+1 555-1234', category: 'Inquiry', startedAt: '2026-01-13T20:45:00.000Z', unread: 2, lastMessage: 'I need help with my invoice.' },
  { id: 'c2', name: 'Carlos Reyes', phone: '+44 7700 900123', category: 'Technical', startedAt: '2026-01-13T19:30:00.000Z', unread: 0, lastMessage: 'The report export failed.' },
  { id: 'c3', name: 'Amina Khan', phone: '+233 20 123 4567', category: 'Complaint', startedAt: '2026-01-13T18:05:00.000Z', unread: 1, lastMessage: 'My transaction is missing.' },
];

const MOCK_TICKETS: TicketItem[] = [
  { id: 't1', name: 'Jane Doe', phone: '+1 555-1234', type: 'Billing', slaLeft: '2 hours left', status: 'Open', details: 'Invoice #1234 shows wrong amount.' },
  { id: 't2', name: 'Carlos Reyes', phone: '+44 7700 900123', type: 'Technical', slaLeft: 'Overdue', status: 'Pending', details: 'Export job failed with code 504.' },
  { id: 't3', name: 'Amina Khan', phone: '+233 20 123 4567', type: 'Account', slaLeft: '5 hours left', status: 'Resolved', details: 'Account reactivated and informed.' },
];

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ status }: { status: TicketItem['status'] }) => {
  const color = status === 'Open' ? 'text-rose-400' : status === 'Pending' ? 'text-amber-400' : 'text-emerald-400';
  return (
    <span className={`text-xs font-semibold ${color}`}>{status}</span>
  );
};

const SupportDashboard: React.FC = () => {
  const { connection, connectionState } = useSignalR();
  const [activeLayer, setActiveLayer] = useState<'chats' | 'tickets'>('chats');
  const [chats, setChats] = useState<ChatItem[]>(() => [...MOCK_CHATS]);
  const [tickets, setTickets] = useState<TicketItem[]>(() => [...MOCK_TICKETS]);
  const [messages, setMessages] = useState<Record<string, string[]>>({});
  
  // Ref to track listener attachment and prevent cleanup loop
  const isListenerAttached = React.useRef(false);
  const handlerRef = React.useRef<((newChat: any) => void) | null>(null);
  const connectionRef = React.useRef(connection);

  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  // Ensure activeConversation persists across renders
  const [activeConversation, setActiveConversation] = useState<ChatItem | null>(null);

  // toolbar
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Pending' | 'Resolved'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [chatsPage, setChatsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 250); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedChat(null);
        setSelectedTicket(null);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  // Monitor connection state and log for debugging
  useEffect(() => {
    
    if (connection && connection.state === 'Connected') {
    } else if (connection && connection.state === 'Disconnected') {
      // Reset listener tracking when disconnected
      isListenerAttached.current = false;
    } else if (connection && connection.state === 'Connecting') {
    }
  }, [connection, connectionState]);

  // SignalR listener for new support requests with stable reference
  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn) {
      return;
    }

    if (connectionState !== 'Connected') {
      return;
    }

    // Guard: If listener already attached, don't re-attach
    if (isListenerAttached.current) {
      return;
    }


    const playNotificationSound = () => {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSmF0fPTgjMGHm7A7+OZURE');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore
      }
    };

    // Create stable handler function and store in ref
    const handleNewRequest = (newChat: any) => {

      const chatItem: ChatItem = {
        id: newChat.id || newChat.conversationId || String(Date.now()),
        name: newChat.customer || newChat.customerName || 'Unknown Customer',
        phone: newChat.mobile || newChat.phone || '',
        category: newChat.type || newChat.category || 'General',
        startedAt: newChat.date || newChat.timestamp || new Date().toISOString(),
        unread: 1,
        lastMessage: newChat.text || newChat.initialMessage || newChat.message || 'New chat request'
      };

      setChats(prev => {
        const exists = prev.find(chat => chat.id === chatItem.id);
        if (exists) return prev; // Skip if already there
        return [chatItem, ...prev];
      });
      playNotificationSound();
    };

    // Hard cleanup for development to prevent ghost listeners
    connection.off('NewSupportRequest');
    connection.off('NewChatRequest');

    // Listen for the custom event dispatched by signalr service
    const handleCustomEvent = (e: any) => handleNewRequest(e.detail);
    window.addEventListener('investa:signalr:new-support-request', handleCustomEvent);
    
    // Also keep direct SignalR listeners as fallback
    connection.on('NewSupportRequest', handleNewRequest);
    connection.on('NewChatRequest', handleNewRequest);
    isListenerAttached.current = true;

    // ðŸš« NO CLEANUP: Listeners remain active for the entire session
    // This ensures SignalR events are always received regardless of component re-mounts
  }, [connectionState]);

  // Enable Chat: Update MessageInput disabled logic
  const isMessageInputDisabled = activeConversation?.status === 'Closed';

  // Real-time Sync: Handle NewMessage listener
  useEffect(() => {
    if (!connection) return;

    const handleNewMessage = (newMessage: any) => {
      if (newMessage.ConversationId === activeConversation?.id) {
        setMessages(prev => ({
          ...prev,
          [newMessage.ConversationId]: [...(prev[newMessage.ConversationId] || []), newMessage]
        }));
      }
    };

    connection.on('NewMessage', handleNewMessage);

    return () => {
      connection.off('NewMessage', handleNewMessage);
    };
  }, [connection, activeConversation]);

  const matches = (s: string) => s.toLowerCase().includes(search.trim().toLowerCase());

  const filteredChats = chats.filter(c => {
    if (search && ![c.name, c.phone, c.category, c.lastMessage || ''].some(matches)) return false;
    if (typeFilter !== 'all' && c.category !== typeFilter) return false;
    if (startDate && new Date(c.startedAt) < new Date(startDate)) return false;
    if (endDate && new Date(c.startedAt) > new Date(endDate)) return false;
    return true;
  });

  const filteredTickets = tickets.filter(t => {
    if (search && ![t.name, t.phone, t.type, t.details || ''].some(matches)) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    return true;
  });

  useEffect(() => {
    setChatsPage(1);
    setTicketsPage(1);
  }, [search, typeFilter, statusFilter, startDate, endDate]);

  const chatsTotalPages = Math.max(1, Math.ceil(filteredChats.length / perPage));
  const ticketsTotalPages = Math.max(1, Math.ceil(filteredTickets.length / perPage));

  const paginatedChats = filteredChats.slice((chatsPage - 1) * perPage, (chatsPage - 1) * perPage + perPage);
  const paginatedTickets = filteredTickets.slice((ticketsPage - 1) * perPage, (ticketsPage - 1) * perPage + perPage);

  const typeOptions = [{ value: 'all', label: 'All Types' }, ...Array.from(new Set([...MOCK_CHATS.map(c => c.category), ...MOCK_TICKETS.map(t => t.type)])).map(v => ({ value: v, label: v }))];

  const handleOpenConversation = (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (chat) {
      setActiveConversation(chat);
      window.dispatchEvent(new CustomEvent('investa:navigate', { detail: { path: `/admin/support/chat/${id}` } }));
    }
  };

  const handleRowClick = async (chatId: string) => {
    try {
      const conversation = await supportService.getConversation(chatId);
      setSelectedChat({
        id: chatId,
        name: conversation.customerName || 'Unknown',
        phone: conversation.userMobile,
        category: conversation.category || 'General',
        startedAt: conversation.startedAt || new Date().toISOString(),
        unread: 0,
        lastMessage: conversation.messageText,
      });
    } catch (error) {
      console.error('Failed to fetch conversation details:', error);
    }
  };

  return (
    <div className="h-full min-h-[48vh] bg-slate-900 text-slate-100 rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
      <aside className="w-full md:w-1/5 lg:w-1/6 border-r border-slate-800 bg-slate-950 p-3">
        <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-3">Support</h3>
        <nav className="space-y-2">
          <button onClick={() => setActiveLayer('chats')} className={`w-full text-left px-3 py-2 rounded-lg ${activeLayer === 'chats' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Active Chats</button>
          <button onClick={() => setActiveLayer('tickets')} className={`w-full text-left px-3 py-2 rounded-lg ${activeLayer === 'tickets' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Tickets</button>
        </nav>
      </aside>

      <main className="flex-1 p-3 overflow-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-100">Customer Support</h1>
              <p className="text-sm text-slate-400 mt-1">Manage active chats and support tickets from a unified dashboard.</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); setStartDate(''); setEndDate(''); }} className="px-3 py-2 bg-slate-800 rounded-lg text-sm">Clear</button>
            </div>
          </div>

          <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                {/* <SearchInput value={search} onChange={setSearch} placeholder="Search customers, phone numbers, messages or ticket IDs..." aria-label="Advanced Search" /> */}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => { /* optional: trigger search analytics */ }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Search</button>
                <button onClick={() => setShowAdvanced(prev => !prev)} aria-expanded={String(showAdvanced)} className="px-3 py-2 bg-slate-800 rounded-lg text-sm">Advanced</button>
              </div>
            </div>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Type</label>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full py-2 pl-3 pr-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm">
                    <option value="all">All Types</option>
                    {Array.from(new Set(MOCK_CHATS.map(c => c.category).concat(MOCK_TICKETS.map(t => t.type)))).map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Status</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full py-2 pl-3 pr-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm">
                    <option value="all">All</option>
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">From</label>
                  <input aria-label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full py-2 pl-3 pr-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">To</label>
                  <input aria-label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full py-2 pl-3 pr-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm" />
                </div>
              </div>
            )}
          </div>
        </div>

        {activeLayer === 'chats' ? (
          <section className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Active Chats</h2>
              <div className="text-sm text-slate-400">{filteredChats.length} results</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between gap-4">
                      <div className="h-4 bg-slate-700 rounded w-40" />
                      <div className="h-4 bg-slate-700 rounded w-28" />
                      <div className="h-4 bg-slate-700 rounded w-20" />
                      <div className="h-4 bg-slate-700 rounded w-36" />
                      <div className="h-7 bg-slate-700 rounded w-7" />
                    </div>
                  ))}
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No active chats</div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-400 uppercase text-xs tracking-wider">
                          <th className="px-4 py-3">Customer Name</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Message Type</th>
                          <th className="px-4 py-3">Start Date &amp; Time</th>
                          <th className="px-4 py-3 text-right">Unread</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedChats.map(c => (
                          <tr key={c.id} className="border-t border-slate-800 hover:bg-slate-800/30 cursor-pointer" tabIndex={0} role="button" onClick={() => handleOpenConversation(c.id)}>
                            <td className="px-4 py-3">{c.name}</td>
                            <td className="px-4 py-3 text-slate-300">{c.phone}</td>
                            <td className="px-4 py-3">{c.category}</td>
                            <td className="px-4 py-3">{formatDate(c.startedAt)}</td>
                            <td className="px-4 py-3 text-right">{c.unread > 0 && <span className="text-rose-400 font-semibold">{c.unread}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="block sm:hidden space-y-3 p-2">
                    {paginatedChats.map(c => (
                          <div key={c.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800" role="button" tabIndex={0} onClick={() => handleOpenConversation(c.id)}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{c.name}</div>
                            <div className="text-xs text-slate-400">{c.phone}</div>
                          </div>
                          <div className="text-rose-400 font-semibold">{c.unread}</div>
                        </div>
                        <div className="text-sm text-slate-300 mt-2">{c.category} • {formatDate(c.startedAt)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 px-3 py-2 flex items-center justify-between">
                    <div className="text-sm text-slate-400">Showing {filteredChats.length === 0 ? 0 : (chatsPage - 1) * perPage + 1}-{Math.min(filteredChats.length, chatsPage * perPage)} of {filteredChats.length}</div>
                    <div className="flex items-center gap-2">
                      <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setChatsPage(1); setTicketsPage(1); }} className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm">
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                      </select>
                      <button disabled={chatsPage <= 1} onClick={() => setChatsPage(p => Math.max(1, p - 1))} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">Prev</button>
                      <span className="text-sm text-slate-300">{chatsPage}/{chatsTotalPages}</span>
                      <button disabled={chatsPage >= chatsTotalPages} onClick={() => setChatsPage(p => Math.min(chatsTotalPages, p + 1))} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedChat && (
              <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="chat-title">
                <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedChat(null)} />
                <div className="ml-auto w-full md:w-1/3 bg-slate-900 border-l border-slate-800 p-3 overflow-auto">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 id="chat-title" className="text-lg font-bold">{selectedChat.name}</h3>
                      <p className="text-sm text-slate-400">{selectedChat.phone} • {selectedChat.category}</p>
                    </div>
                    <div>
                      <button aria-label="Close chat" onClick={() => setSelectedChat(null)} className="text-slate-400 hover:text-white">Close</button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-slate-200">
                    <div className="mb-3"><strong>Last message:</strong>
                      <div className="mt-2 p-3 bg-slate-800 rounded-lg text-slate-300">{selectedChat.lastMessage}</div>
                    </div>
                    <div><strong>Started:</strong> {formatDate(selectedChat.startedAt)}</div>

                    <div className="mt-4">
                      <strong>Conversation</strong>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        { (messages[selectedChat.id] || []).map((m, idx) => (
                          <div key={idx} className="text-sm text-slate-200 bg-slate-800 p-2 rounded">{m}</div>
                        )) }
                      </div>

                      <div className="mt-3 flex gap-2">
                        <input aria-label="Reply" className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-200" placeholder="Type a reply..." value={messages[`draft-${selectedChat.id}`] || ''} onChange={(e) => setMessages(prev => ({ ...prev, [`draft-${selectedChat.id}`]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') {
                          const draft = messages[`draft-${selectedChat.id}`] || '';
                          if (draft.trim()) setMessages(prev => ({ ...prev, [selectedChat.id]: [...(prev[selectedChat.id] || []), draft.trim()], [`draft-${selectedChat.id}`]: '' }));
                        } }} />
                        <button onClick={() => {
                          const draft = messages[`draft-${selectedChat.id}`] || '';
                          if (draft.trim()) setMessages(prev => ({ ...prev, [selectedChat.id]: [...(prev[selectedChat.id] || []), draft.trim()], [`draft-${selectedChat.id}`]: '' }));
                        }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Send</button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button onClick={() => { setChats(prev => prev.map(p => p.id === selectedChat.id ? { ...p, unread: 0 } : p)); setSelectedChat(null); }} className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg">Close Chat</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tickets</h2>
              <div className="text-sm text-slate-400">{filteredTickets.length} results</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden flex flex-col h-full">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between gap-4">
                      <div className="h-4 bg-slate-700 rounded w-40" />
                      <div className="h-4 bg-slate-700 rounded w-28" />
                      <div className="h-4 bg-slate-700 rounded w-20" />
                      <div className="h-4 bg-slate-700 rounded w-36" />
                      <div className="h-7 bg-slate-700 rounded w-10" />
                    </div>
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No tickets found</div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-400 uppercase text-xs tracking-wider">
                          <th className="px-4 py-3">Customer Name</th>
                          <th className="px-4 py-3">Phone</th>
                          <th className="px-4 py-3">Ticket Type</th>
                          <th className="px-4 py-3">SLA</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTickets.map(t => (
                          <tr key={t.id} className="border-t border-slate-800 hover:bg-slate-800/30 cursor-pointer" tabIndex={0} role="button" onClick={() => setSelectedTicket(t)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTicket(t); }}>
                            <td className="px-4 py-3">{t.name}</td>
                            <td className="px-4 py-3 text-slate-300">{t.phone}</td>
                            <td className="px-4 py-3">{t.type}</td>
                            <td className="px-4 py-3">{t.slaLeft}</td>
                            <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-semibold">Show Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="block sm:hidden space-y-3 p-2">
                    {paginatedTickets.map(t => (
                      <div key={t.id} className="bg-slate-900 p-2 rounded-lg border border-slate-800" role="button" tabIndex={0} onClick={() => setSelectedTicket(t)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTicket(t); }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{t.name}</div>
                            <div className="text-xs text-slate-400">{t.phone}</div>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                        <div className="text-sm text-slate-300 mt-2">{t.type} • {t.slaLeft}</div>
                        <div className="mt-3 text-right">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedTicket(t); }} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-semibold">Show</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 px-3 py-2 flex items-center justify-between">
                    <div className="text-sm text-slate-400">Showing {filteredTickets.length === 0 ? 0 : (ticketsPage - 1) * perPage + 1}-{Math.min(filteredTickets.length, ticketsPage * perPage)} of {filteredTickets.length}</div>
                    <div className="flex items-center gap-2">
                      <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setChatsPage(1); setTicketsPage(1); }} className="bg-slate-800 text-slate-200 rounded px-2 py-1 text-sm">
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={20}>20 / page</option>
                      </select>
                      <button disabled={ticketsPage <= 1} onClick={() => setTicketsPage(p => Math.max(1, p - 1))} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">Prev</button>
                      <span className="text-sm text-slate-300">{ticketsPage}/{ticketsTotalPages}</span>
                      <button disabled={ticketsPage >= ticketsTotalPages} onClick={() => setTicketsPage(p => Math.min(ticketsTotalPages, p + 1))} className="px-2 py-1 bg-slate-800 rounded disabled:opacity-50">Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedTicket && (
              <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-labelledby="ticket-title">
                <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTicket(null)} />
                <div className="ml-auto w-full md:w-1/3 bg-slate-900 border-l border-slate-800 p-3 overflow-auto">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 id="ticket-title" className="text-lg font-bold">Ticket {selectedTicket.id}</h3>
                      <p className="text-sm text-slate-400">{selectedTicket.name} • {selectedTicket.phone}</p>
                    </div>
                    <div>
                      <button aria-label="Close ticket" onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white">Close</button>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <div><strong>Type:</strong> {selectedTicket.type}</div>
                    <div><strong>SLA:</strong> {selectedTicket.slaLeft}</div>
                    <div><strong>Status:</strong> <StatusBadge status={selectedTicket.status} /></div>
                    <div className="pt-2"><strong>Details:</strong>
                      <div className="mt-2 p-3 bg-slate-800 rounded-lg text-slate-300">{selectedTicket.details}</div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button onClick={() => {
                      const name = prompt('Assign ticket to (name)');
                      if (name) setTickets(prev => prev.map(p => p.id === selectedTicket.id ? { ...p, details: `${p.details || ''}\n\nAssigned to: ${name}` } : p));
                    }} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Assign</button>
                    <button onClick={() => { setTickets(prev => prev.map(p => p.id === selectedTicket.id ? { ...p, status: 'Resolved' } : p)); setSelectedTicket(null); }} className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg">Close Ticket</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default SupportDashboard;

