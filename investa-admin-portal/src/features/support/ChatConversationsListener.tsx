import React, { useEffect } from 'react';
import { onMessageListener } from '@/services/fcmService';
import { useChatStore } from '@/services/chatStore';
import { supportService } from '@/services/supportService';
import { Conversation, Message } from '@/types';

export const ChatConversationsListener: React.FC = () => {
  const addConversation = useChatStore(state => state.addConversation);
  const receiveMessage = useChatStore(state => state.receiveMessage);
  const setActiveConversation = useChatStore(state => state.setActiveConversation);

  useEffect(() => {
    
    const handleFcmMessage = (payload: any) => {
      // payload structure from Firebase JS SDK:
      // { data: { ... }, notification: { ... } }
      const data = payload?.data;
      if (!data) return;

      const type = data.type;
      
      if (type === 'new_request') {
        const convId = data.conversationId;
        const userMobile = data.userMobile;
        
        const conv: Conversation = {
            id: convId,
            userMobile: userMobile,
            lastMessage: payload.notification?.body || 'New Request',
            unreadCount: 1,
            messages: []
        };
        addConversation(conv);
        
        // Toast logic (optional, relying on notification usually)
        try {
            const chatRequest = {
                id: convId,
                fromUserId: null,
                fromName: userMobile,
                message: conv.lastMessage,
                createdAt: new Date().toISOString()
            };
            window.dispatchEvent(new CustomEvent('investa:ui:new-chat', { detail: chatRequest }));
        } catch (e) { /* ignore */ }

      } else if (type === 'message') {
         const convId = data.conversationId;
         const message: Message = {
            id: String(Date.now()), // ID not always in data, generate temp or use timestamp
            fromUserId: data.userMobile,
            from: data.userMobile,
            text: payload.notification?.body || '',
            createdAt: new Date().toISOString()
         };
         
         if(convId) {
             receiveMessage(convId, message);
         }
      }
    };

    const unsubscribeFcm = onMessageListener(handleFcmMessage);

    // Listen for UI-driven open-conversation events from toasts
    const onOpenConversation = async (e: any) => {
      const conversationId = e?.detail?.conversationId || e?.detail;
      if (!conversationId) return;

      try {
        const conv = await supportService.getConversation(conversationId);
        if (conv) addConversation(conv as Conversation);
      } catch (err) {
        // ignore failures
      }

      try { await setActiveConversation(conversationId); } catch (e) { /* ignore */ }
    };
    window.addEventListener('investa:ui:open-conversation', onOpenConversation as EventListener);

    return () => {
      unsubscribeFcm();
      window.removeEventListener('investa:ui:open-conversation', onOpenConversation as EventListener);
    };
  }, [addConversation, receiveMessage, setActiveConversation]);

  return null;
};

export default ChatConversationsListener;
