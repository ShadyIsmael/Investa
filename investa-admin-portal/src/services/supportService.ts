import { api, getAuthToken } from '@/api/api';
import { MOCK_SUPPORT_REQUESTS } from '@/mocks';
import { SupportRequest } from '@/types';

export const supportService = {
  async getTickets(): Promise<SupportRequest[]> {
    const res = await api.get<any>('/api/support/tickets', MOCK_SUPPORT_REQUESTS);
    return res?.data ?? res ?? [];
  },

  async markAsRead(conversationId: string) {
    try {
      const res = await api.post<any>('/api/support/mark-as-read', { conversationId });
      return res;
    } catch (e) {
      throw e;
    }
  },

  async getConversation(conversationId: string) {
    try {
      const adminToken = getAuthToken() || '';
      const response = await api.get<any>(`/api/support/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const data = response.data;
      return {
        ...data,
        userMobile: data.userMobile ?? data.UserMobile ?? '',
        messageText: data.messageText ?? data.MessageText ?? '',
      };
    } catch (e) {
      console.error('Error fetching conversation:', e);
      throw e;
    }
  },

  async getConversations() {
    try {
      const res = await api.get<any>('/api/support/conversations');
      return res?.data || res || [];
    } catch (e) {
      return [];
    }
  },

  // Backwards-compatible alias as requested by UI: getAllConversations
  async getAllConversations() {
    return await this.getConversations();
  },

  async sendMessage(sessionId: string, text: string) {
    try {
      const payload = {
        Message: text
      };
      const res = await api.post<any>(
        `/api/support/sessions/${sessionId}/messages`, // المسار كامل
        payload
      );
      return res;
    } catch (e) {
      console.error("Error in supportService.sendMessage:", e);
      throw e;
    }
  },

  async setStatus(conversationId: string, status: string) {
    try {
      const payload = { status: status === 'Active' ? 'Open' : status };
      const res = await api.post<any>(`/api/support/conversations/${conversationId}/status`, payload);
      return res;
    } catch (e) {
      throw e;
    }
  }
};
