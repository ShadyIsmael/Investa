import React, { useEffect, useState, useCallback } from 'react';
import { useSignalR } from '../../services/signalr';
import ChatRequestToast from './ChatRequestToast';
import { ChatRequestPayload } from '../types';

const AUTO_DISMISS_MS = 12000; // 12s per toast

export const ChatRequestListener: React.FC = () => {
  const { on, off, connectionState } = useSignalR();
  const [requests, setRequests] = useState<ChatRequestPayload[]>([]);

  const pushRequest = useCallback((payload: any) => {
    // Normalize the payload into ChatRequestPayload
    const chat: ChatRequestPayload = {
      id: String(payload?.id || Date.now()),
      fromUserId: payload?.fromUserId || payload?.userId || null,
      fromName: payload?.fromName || payload?.from || payload?.name || null,
      message: payload?.message || payload?.text || '',
      createdAt: payload?.createdAt || new Date().toISOString(),
    };

    setRequests(prev => [chat, ...prev]);

    // Auto-dismiss after a short delay
    setTimeout(() => {
      setRequests(prev => prev.filter(r => r.id !== chat.id));
    }, AUTO_DISMISS_MS);
  }, []);

  useEffect(() => {
    // Primary subscription (SignalR direct)
    on('NewChatRequest', pushRequest);

    // Fallback: also listen to the forwarded window event
    const onWin = (e: any) => pushRequest(e?.detail);
    window.addEventListener('investa:signalr:new-chat', onWin as EventListener);

    return () => {
      off('NewChatRequest', pushRequest);
      window.removeEventListener('investa:signalr:new-chat', onWin as EventListener);
    };
  }, [on, off, pushRequest]);

  const handleClose = (id: string) => setRequests(prev => prev.filter(r => r.id !== id));

  if (requests.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {requests.map(req => (
        <div key={req.id} className="animate-in fade-in slide-in-from-bottom-6 duration-200">
          <ChatRequestToast request={req} onClose={handleClose} />
        </div>
      ))}
    </div>
  );
};

export default ChatRequestListener;
