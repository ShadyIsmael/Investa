import React, { useEffect } from 'react';
import { useSignalR } from '@/services/signalr';
import { useChatStore } from '@/services/chatStore';
import { Conversation, Message } from '@/types';

export const ChatConversationsListener: React.FC = () => {
  const { on, off } = useSignalR();
  const addConversation = useChatStore(state => state.addConversation);
  const receiveMessage = useChatStore(state => state.receiveMessage);
  const setActiveConversation = useChatStore(state => state.setActiveConversation);

  useEffect(() => {
    // Server assigns a new user/conversation to the admin
    const handleAssigned = (payload: any) => {
      // Normalize common variants from the backend
      const convId = String(payload?.ConvId || payload?.convId || payload?.conversationId || payload?.id || Date.now());
      const userMobile = payload?.UserMobile || payload?.userMobile || payload?.mobile || payload?.from || 'Unknown';
      const status = payload?.Status || payload?.status || '';

      const conv: Conversation = {
        id: convId,
        userMobile,
        lastMessage: payload?.lastMessage || (status ? `Status: ${status}` : 'Assigned to you'),
        unreadCount: payload?.unreadCount ?? 1,
        messages: payload?.messages || []
      };

      addConversation(conv);

      // Also emit a UI toast via the existing ChatRequestListener fallback so admins see the assignment
      try {
        const chatRequest = {
          id: convId,
          fromUserId: null,
          fromName: userMobile,
          message: conv.lastMessage,
          createdAt: new Date().toISOString()
        };
        window.dispatchEvent(new CustomEvent('investa:signalr:new-chat', { detail: chatRequest }));
      } catch (e) { /* ignore */ }
    };

    // Incoming message for a conversation
    const handleMessage = (payload: any) => {
      const convId = payload?.conversationId || payload?.convId || payload?.id;
      const message: Message = {
        id: String(payload?.messageId || payload?.id || Date.now()),
        fromUserId: payload?.fromUserId || payload?.from || null,
        from: payload?.from || null,
        text: payload?.text || payload?.message || '',
        createdAt: payload?.createdAt || new Date().toISOString()
      };
      if (!convId) return;
      receiveMessage(String(convId), message);
    };

    on('AssignedNewUser', handleAssigned);
    on('ReceiveMessage', handleMessage);

    // fallback to forwarded window events if server forwards them there
    const winAssigned = (e: any) => handleAssigned(e?.detail);
    const winMessage = (e: any) => handleMessage(e?.detail);
    window.addEventListener('investa:signalr:assigned-user', winAssigned as EventListener);
    window.addEventListener('investa:signalr:receive-message', winMessage as EventListener);

    // Listen for UI-driven open-conversation events from toasts
    const onOpenConversation = async (e: any) => {
      const conversationId = e?.detail?.conversationId || e?.detail;
      if (!conversationId) return;

      try {
        const svc = await import('../../services/supportService');
        const conv = await svc.supportService.getConversation(conversationId);
        if (conv) addConversation(conv as Conversation);
      } catch (err) {
        // ignore failures
      }

      try { await setActiveConversation(conversationId); } catch (e) { /* ignore */ }
    };
    window.addEventListener('investa:ui:open-conversation', onOpenConversation as EventListener);

    return () => {
      off('AssignedNewUser', handleAssigned);
      off('ReceiveMessage', handleMessage);
      window.removeEventListener('investa:signalr:assigned-user', winAssigned as EventListener);
      window.removeEventListener('investa:signalr:receive-message', winMessage as EventListener);
      window.removeEventListener('investa:ui:open-conversation', onOpenConversation as EventListener);
    };
  }, [on, off, addConversation, receiveMessage, setActiveConversation]);

  return null;
};

export default ChatConversationsListener;
