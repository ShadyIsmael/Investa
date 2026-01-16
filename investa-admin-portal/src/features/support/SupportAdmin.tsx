import React, { useEffect, useState } from 'react';
import { supportService } from '../../services/supportService';
import { Conversation } from '../../types';
import { Icon } from '../../../components/Icons';

export const SupportAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await supportService.getConversations();
        if (mounted) setConversations(data);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const open = (convId: string) => {
    // Navigate to chat route and emit open conversation
    try {
      history.pushState({}, '', `/admin/support/chat/${convId}`);
      window.dispatchEvent(new CustomEvent('investa:ui:open-conversation', { detail: { conversationId: convId } }));
    } catch (e) { /* ignore */ }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Support Conversations</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm uppercase text-[12px]"><tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {conversations.map(conv => (
              <tr key={conv.id} className="hover:bg-slate-50 transition-all">
                <td className="px-4 py-3">{conv.userMobile}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm">{(conv as any).category || 'General'}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-sm ${((conv as any).status||'Open') === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{(conv as any).status || 'Open'}</span></td>
                <td className="px-4 py-3 text-right"><button onClick={() => open(conv.id)} className="text-indigo-600 font-semibold text-sm">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportAdmin;