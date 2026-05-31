
import { api } from '@/api/api';
import * as Mocks from '@/mocks';
import { Account, Invoice, JournalEntry, CashFlowPoint, DashboardStat, ChartDataPoint } from '@/types';

export const financeService = {
  async getDashboardStats(): Promise<DashboardStat[]> {
    const res = await api.get<any>('/api/analytics/stats', Mocks.DASHBOARD_STATS);
    return res?.data ?? res ?? [];
  },

  async getRevenueData(): Promise<ChartDataPoint[]> {
    try {
      // New backend endpoint that returns timeseries for organization revenue
      // Example item: { id: 3, amount: 50.00, month: "March" }
      const res = await api.get<any>('/api/v1/admin/dashboard/org/timeseries', Mocks.REVENUE_DATA);
      console.debug('[financeService] raw getRevenueData response:', res);
      let data: any = res?.data ?? res ?? [];

      // If the API returned a JSON string (some backends stringify payloads), try parsing it
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          data = parsed;
        } catch (e) {
          // leave data as-is
        }
      }

      // If wrapper's `data` is a stringified JSON, parse it
      if (data && typeof data === 'object' && typeof data.data === 'string') {
        try {
          const parsedInner = JSON.parse(data.data);
          data = parsedInner;
        } catch (e) { /* ignore */ }
      }

      // Accept wrapper shapes
      if (!Array.isArray(data)) {
        if (data && typeof data === 'object') {
          if (Array.isArray(data.items)) data = data.items;
          else if (Array.isArray(data.timeseries)) data = data.timeseries;
          else data = [];
        } else {
          data = [];
        }
      }

      // If the backend already returns ChartDataPoint-like objects, use them directly
      if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object' && 'name' in data[0] && 'value' in data[0]) {
        return data as ChartDataPoint[];
      }

      // Map backend shape to ChartDataPoint used by the charts
      return data.map((item: any) => {
        const name = item.month ?? item.name ?? item.label ?? String(item.id ?? '');
        const amountRaw = item.amount ?? item.value ?? item.total ?? 0;
        const value = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw || 0);
        const uv = typeof item.uv === 'number' ? item.uv : value;
        return { name, value, uv } as ChartDataPoint;
      });
    } catch (err) {
      console.error('[financeService] getRevenueData error', err);
      // Fallback to mocked data
      return Mocks.REVENUE_DATA;
    }
  },

  async getInvestmentsByCategory(): Promise<{ name: string; value: number }[]> {
    try {
      const res = await api.get<any>('/api/v1/admin/dashboard/investments/stats/by-category', []);
      let data: any = res?.data ?? res ?? [];

      // Accept a few common wrapper shapes
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) { /* ignore */ }
      }

      if (data && typeof data === 'object' && Array.isArray(data.items)) data = data.items;

      if (!Array.isArray(data)) return [];

      // Normalize to { name, value }
      return data.map((item: any) => {
        const name = item.name ?? item.category ?? item.categoryName ?? String(item.id ?? 'Uncategorized');
        const raw = item.value ?? item.amount ?? item.total ?? item.sum ?? 0;
        const value = typeof raw === 'number' ? raw : Number(raw || 0);
        return { name, value };
      });
    } catch (err) {
      console.error('[financeService] getInvestmentsByCategory error', err);
      return [];
    }
  },

  async getCOA(): Promise<Account[]> {
    const res = await api.get<any>('/api/finance/coa', Mocks.MOCK_COA);
    return res?.data ?? res ?? [];
  },

  async getInvoices(): Promise<Invoice[]> {
    const res = await api.get<any>('/api/finance/invoices', Mocks.MOCK_INVOICES);
    return res?.data ?? res ?? [];
  },

  async getJournals(): Promise<JournalEntry[]> {
    const res = await api.get<any>('/api/finance/journals', Mocks.MOCK_JOURNALS);
    return res?.data ?? res ?? [];
  },

  async getCashFlow(): Promise<CashFlowPoint[]> {
    const res = await api.get<any>('/api/finance/cashflow', Mocks.MOCK_CASHFLOW);
    return res?.data ?? res ?? [];
  },

  async getCreditPlanStats(): Promise<{ name: string; value: number; credits: number }[]> {
    try {
      const res = await api.get<any>('/api/credit-plans/admin', []);
      const data: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return data
        .filter((p: any) => p.isActive !== false)
        .map((p: any) => ({
          name: p.name ?? 'Plan',
          value: typeof p.price === 'number' ? p.price : Number(p.price ?? 0),
          credits: typeof p.credits === 'number' ? p.credits : Number(p.credits ?? 0),
        }));
    } catch {
      return [];
    }
  },

  /** Returns how many times each plan has been purchased – used for the dashboard chart. */
  async getCreditPlanPurchaseStats(): Promise<{ name: string; value: number; credits: number }[]> {
    try {
      const res = await api.get<any>('/api/credit-plans/purchases/stats', []);
      const data: any[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return data.map((item: any) => ({
        name:    item.name    ?? 'Plan',
        value:   typeof item.value   === 'number' ? item.value   : Number(item.value   ?? 0),
        credits: typeof item.credits === 'number' ? item.credits : Number(item.credits ?? 0),
      }));
    } catch {
      return [];
    }
  },
};
