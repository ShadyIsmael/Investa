import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { supportService } from './supportService';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  addConversation: (conv: Conversation) => void;
  receiveMessage: (convId: string, message: Message) => void;
  setActiveConversation: (convId: string | null) => Promise<void>;
  markAsRead: (convId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  addConversation: (conv) => set((s) => {
    const exists = s.conversations.find(c => c.id === conv.id);
    if (exists) {
      // Update existing conversation and move it to the front
      const updated = { ...exists, ...conv };
      const rest = s.conversations.filter(c => c.id !== conv.id);
      return { conversations: [updated, ...rest] };
    }
    return { conversations: [conv, ...s.conversations] };
  }),

  receiveMessage: (convId, message) => set((s) => {
    const idx = s.conversations.findIndex(c => c.id === convId);
    if (idx === -1) {
      // If conversation doesn't exist, create a lightweight one
      const newConv: Conversation = {
        id: convId,
        userMobile: message.from || String(message.fromUserId || ''),
        lastMessage: message.text || '',
        unreadCount: s.activeConversationId === convId ? 0 : 1,
        messages: [message]
      };
      return { conversations: [newConv, ...s.conversations] };
    }

    const conv = s.conversations[idx];
    const updated: Conversation = {
      ...conv,
      messages: [...conv.messages, message],
      lastMessage: message.text || '',
      unreadCount: s.activeConversationId === convId ? 0 : conv.unreadCount + 1
    };

    const conversations = [...s.conversations];
    conversations.splice(idx, 1);
    conversations.unshift(updated);
    return { conversations };
  }),

  setActiveConversation: async (convId) => {
    set(() => ({ activeConversationId: convId }));
    if (!convId) return;
    try {
      await get().markAsRead(convId);
    } catch (e) {
      console.warn('Failed to mark as read', e);
    }
  },

  markAsRead: async (convId) => {
    try {
      await supportService.markAsRead(convId);

      // Clear locally
      set((s) => ({
        conversations: s.conversations.map(c => c.id === convId ? { ...c, unreadCount: 0 } : c)
      }));

      // Notify server via SignalR (provider listens to this window event and will invoke the hub)
      try { window.dispatchEvent(new CustomEvent('investa:signalr:mark-as-read', { detail: { conversationId: convId } })); } catch (e) { /* ignore */ }
    } catch (e) {
      console.warn('markAsRead failed', e);
      throw e;
    }
  }
}));
