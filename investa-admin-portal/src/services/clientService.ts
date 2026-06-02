
import { api } from '@/api/api';
import { TOP_SCORED_CLIENTS } from '@/mocks';
import { Client } from '@/types';

export const clientService = {
  async getClients(): Promise<Client[]> {
    try {
      const res = await api.get<any>('/api/v1/admin/clients');
      // Debug: log raw response to help diagnose empty results
      // eslint-disable-next-line no-console
      console.debug('[clientService] raw getClients response:', res);

      let data: any = res?.data ?? res ?? [];

      // Accept a few common wrapper shapes and single-object responses
      if (!Array.isArray(data)) {
        if (data && typeof data === 'object') {
          if (Array.isArray(data.items)) data = data.items;
          else if (Array.isArray(data.clients)) data = data.clients;
          else data = [data];
        } else {
          data = [];
        }
      }

      // Map backend shape to Client (supports various casing and wrapper shapes)
      return data.map((item: any) => {
        const id = String(item.userId ?? item.UserId ?? item.id ?? item.Id ?? item.clientId ?? '');
        const name = (item.FullName ?? item.fullName ?? item.fullName ?? item.name ?? item.full_name ?? '') as string;
        const registrationDate = item.RegisteredDate ?? item.registeredDate ?? item.createdAt ?? item.registeredDate ?? item.registrationDate ?? '';
        const status = (item.AccountStatus ?? item.accountStatus ?? item.status ?? item.AccountStatus ?? 'Pending') as Client['status'];

        // Score may be provided as 0-1 or 0-100 depending on API; normalize to 0-100 integer percent
        const rawScore = typeof item.Score === 'number' ? item.Score : typeof item.score === 'number' ? item.score : (item.verificationPercent ?? 0);
        let verificationPercent = 0;
        if (typeof rawScore === 'number') {
          if (rawScore >= 0 && rawScore <= 1) verificationPercent = Math.round(rawScore * 100);
          else verificationPercent = Math.min(100, Math.round(rawScore));
        }

        const avatar = item.personalImageUrl ?? item.avatar ?? `https://picsum.photos/seed/${id}/100/100`;
        const email = item.email ?? item.Email ?? '';
        const hasActiveNotificationToken = Boolean(item.hasActiveNotificationToken ?? item.HasActiveNotificationToken ?? false);
        const activeNotificationTokens = Number(item.activeNotificationTokens ?? item.ActiveNotificationTokens ?? 0);
        return {
          id,
          name,
          email,
          registrationDate,
          status,
          verificationPercent,
          avatar,
          hasActiveNotificationToken,
          activeNotificationTokens,
        } as Client;
      });
    } catch (err) {
      console.error('[clientService] getClients error', err);
      return [];
    }
  },

  async getTopClients(): Promise<Client[]> {
    try {
      // New dashboard endpoint for top clients
      const res = await api.get<any>('/api/v1/admin/dashboard/top-clients', TOP_SCORED_CLIENTS);
      const data = res?.data ?? res ?? [];

      if (!Array.isArray(data)) return TOP_SCORED_CLIENTS;

      // Map API shape { name, userId, score } -> Client

      const mapped = data.map((item: any) => {
        const id = String(item.userId ?? item.user_id ?? item.id ?? '');
        const name = item.name ?? item.fullName ?? item.full_name ?? '';
        const rawScore = item.score ?? item.Score ?? item.scoring ?? 0;
        // Keep both the raw score and a percentage-friendly field
        let verificationPercent = 0;
        if (typeof rawScore === 'number') {
          verificationPercent = rawScore >= 0 && rawScore <= 1 ? Math.round(rawScore * 100) : Math.round(Math.min(100, rawScore));
        }
        const scoreValue = typeof rawScore === 'number' ? rawScore : Number(rawScore || 0);
        return {
          id,
          name,
          email: '',
          registrationDate: '',
          status: 'Active',
          verificationPercent,
          score: scoreValue,
          avatar: `https://picsum.photos/seed/${encodeURIComponent(id)}/100/100`,
          hasActiveNotificationToken: Boolean(item.hasActiveNotificationToken ?? item.HasActiveNotificationToken ?? false),
          activeNotificationTokens: Number(item.activeNotificationTokens ?? item.ActiveNotificationTokens ?? 0),
        } as any as Client;
      }).slice(0, 10);

      return mapped;
    } catch (err) {
      console.error('[clientService] getTopClients error', err);
      // Fallback to mock data to keep the dashboard usable when backend fails
      return TOP_SCORED_CLIENTS;
    }
  }
  ,

  async getClient(userId: string | number): Promise<Client | null> {
    try {
      // Use relative API path so the configured BASE_URL / dev proxy is respected
      const endpoint = `/api/clients/${userId}`;
      const resp = await api.get<any>(endpoint);

      const data = resp?.data ?? resp ?? null;
      if (!data) return null;

      const id = String(data.userId ?? data.id ?? '');
      const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || (data.fullName ?? data.name ?? '');
      const registrationDate = data.createdAt || data.registeredDate || data.registrationDate || '';
      const status = (data.statusName || (data.status || 'Pending')) as Client['status'];
      const verificationPercent = typeof data.score === 'number' ? Math.round(Math.min(100, data.score)) : 0;
      const avatar = data.personalImageUrl || data.personalImage || data.avatar || `https://picsum.photos/seed/${id}/100/100`;
      const email = data.email || '';
      const hasActiveNotificationToken = Boolean(data.hasActiveNotificationToken ?? data.HasActiveNotificationToken ?? false);
      const activeNotificationTokens = Number(data.activeNotificationTokens ?? data.ActiveNotificationTokens ?? 0);

      return {
        id,
        name,
        email,
        registrationDate,
        status,
        verificationPercent,
        avatar,
        hasActiveNotificationToken,
        activeNotificationTokens,
      } as Client;
    } catch (err) {
      console.error('[clientService] getClient error', err);
      return null;
    }
  },
  async getClientProfile(userId: string | number): Promise<any | null> {
    try {
      const endpoint = `/api/clients/${userId}`;
      const resp = await api.get<any>(endpoint);
      const data = resp?.data ?? resp ?? null;
      return data ?? null;
    } catch (err) {
      console.error('[clientService] getClientProfile error', err);
      return null;
    }
  },

  async updateClientStatus(userId: string | number, status: string, justification?: string): Promise<any> {
    try {
      const endpoint = `/api/clients/${userId}/status`;
      // Use POST so backend can log justification and produce an event
      const resp = await api.post<any>(endpoint, { status, justification });
      return resp?.data ?? resp ?? null;
    } catch (err) {
      console.error('[clientService] updateClientStatus error', err);
      throw err;
    }
  }
};
