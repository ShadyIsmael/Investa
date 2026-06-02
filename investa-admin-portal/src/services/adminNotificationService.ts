import { api } from '@/api/api';

export interface SpecialNotificationResult {
  userId: string;
  success: boolean;
  message: string;
  tokensFound?: number;
  successCount?: number;
  failureCount?: number;
}

export interface BulkSpecialNotificationSummary {
  total: number;
  succeeded: number;
  failed: number;
  results: SpecialNotificationResult[];
}

export const adminNotificationService = {
  async sendSpecialNotificationToUser(userId: string, title: string, body: string): Promise<SpecialNotificationResult> {
    try {
      const response = await api.post<any>('/api/v1/notifications/send-test', {
        userId,
        title,
        body,
      });

      const payload = response?.data ?? response ?? {};
      return {
        userId,
        success: Boolean(payload?.success),
        message: String(payload?.message ?? (payload?.success ? 'Notification sent.' : 'Failed to send notification.')),
        tokensFound: typeof payload?.tokensFound === 'number' ? payload.tokensFound : undefined,
        successCount: typeof payload?.successCount === 'number' ? payload.successCount : undefined,
        failureCount: typeof payload?.failureCount === 'number' ? payload.failureCount : undefined,
      };
    } catch (error: any) {
      const message = error?.message || 'Failed to send notification.';
      return {
        userId,
        success: false,
        message,
      };
    }
  },

  async sendSpecialNotificationToUsers(userIds: string[], title: string, body: string): Promise<BulkSpecialNotificationSummary> {
    const distinctIds = Array.from(new Set(userIds.filter(Boolean)));
    const results = await Promise.all(
      distinctIds.map((id) => this.sendSpecialNotificationToUser(id, title, body))
    );

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    return {
      total: results.length,
      succeeded,
      failed,
      results,
    };
  },
};
