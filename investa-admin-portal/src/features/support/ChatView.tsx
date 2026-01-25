import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supportService } from '../../services/supportService';
import { useChatStore } from '@/services/chatStore';
import { useSignalR } from '../../services/signalr';
import { Message } from '../../types';

// Note: This project doesn't use react-router by default; we'll support passing conversationId as prop
export const ChatView: React.FC<{ supportSessionId?: string }> = React.memo(({ supportSessionId: propSessionId }) => {
  // Extract conversation ID from URL path (e.g., /admin/support/chat/:id)
  const sessionId = propSessionId || (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean).pop() : undefined) || '';
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [text, setText] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value), []);
  const { connection } = useSignalR();
  const addConversation = useChatStore(s => s.addConversation);
  const receiveMessage = useChatStore(s => s.receiveMessage);
  const setActiveConversation = useChatStore(s => s.setActiveConversation);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Try to get initial message from navigation state (passed via CustomEvent)
    try {
      const navState = (window.history.state as any)?.customer;
      if (navState?.lastMessage || navState?.initialMessage) {
        setInitialMessage(navState.lastMessage || navState.initialMessage);
      }
    } catch (e) {
      // Ignore
    }

    const load = async () => {
      try {
        const session = await supportService.getConversation(sessionId);
        if (session) {
          addConversation(session as any);
          setMessages(session.messages || []);
          // Mark as in progress/read
          await supportService.setStatus(sessionId, 'Open');
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (sessionId) load();

    // Join the global Admins group to receive all support messages and notifications
    if (connection) {
      try { 
        connection.invoke('JoinGroup', 'Admins').catch(() => {});
        console.log("Joined the Admins notification group successfully.");
      } catch { /* ignore */ }
    }

    // Listen for new messages via window events
    const onMessage = (e: any) => {
      const payload = e?.detail || e;
      const incomingSessionId = payload?.SupportSessionId;
      if (incomingSessionId !== sessionId) return;
      const msg: Message = {
        id: String(payload?.MessageId || Date.now()),
        fromUserId: payload?.FromUserId || null,
        from: payload?.From || null,
        text: payload?.Text || '',
        createdAt: payload?.CreatedAt || new Date().toISOString()
      };
      setMessages(prev => [...prev, msg]);
      receiveMessage(sessionId, msg);
    };

    window.addEventListener('investa:signalr:receive-message', onMessage as EventListener);
    return () => {
      window.removeEventListener('investa:signalr:receive-message', onMessage as EventListener);
      if (connection) try { connection.invoke('LeaveGroup', 'Admins').catch(() => {}); } catch { /* ignore */ }
      mounted = false;
    };
  }, [sessionId, connection, addConversation, receiveMessage, setActiveConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    if (!text.trim()) return;
    const msgText = text.trim();
    setText('');
    try {
      await supportService.sendMessage(sessionId, msgText);
      // optimistically add
      const msg: Message = { id: String(Date.now()), from: 'You', text: msgText, createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, msg]);
    } catch (e) {
      console.warn('send failed', e);
    }
  }, [text, sessionId]);

  if (!sessionId) return <div className="p-6">No conversation selected</div>;
  if (loading) return <div className="p-6">Loading conversation...</div>;

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map(m => (
          <div key={m.id} className={`mb-3 ${m.from === 'You' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded-lg ${m.from === 'You' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'}`}>{m.text}</div>
            <div className="text-[11px] text-slate-400 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-3">
        <input value={text} onChange={handleInputChange} className="flex-1 px-3 py-2 rounded-lg border border-slate-200" placeholder="Type a message..." />
        <button onClick={send} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Send</button>
      </div>
    </div>
  );
});

(ChatView as unknown as React.FC).displayName = 'ChatView';

export default ChatView;