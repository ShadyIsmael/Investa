import { api } from '@/api/api';

export type ReportStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Dismissed';
export type ReportTargetType = 'Opportunity' | 'User' | 'Conversation' | 'Participant';
export type ReportReasonCode =
  | 'SuspiciousOpportunity'
  | 'MisleadingInformation'
  | 'Spam'
  | 'Abuse'
  | 'FraudConcern'
  | 'InappropriateContent'
  | 'Other';

export interface ModerationReport {
  id: number;
  reporterUserId: string;
  targetType: ReportTargetType;
  targetId: string;
  reasonCode: ReportReasonCode;
  description: string | null;
  status: ReportStatus;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  targetType?: ReportTargetType;
}

interface ApiEnvelope<T> {
  data?: T;
}

const unwrap = <T>(response: T | ApiEnvelope<T>): T =>
  (response as ApiEnvelope<T>).data ?? (response as T);

const buildReportsUrl = (filters: ReportFilters = {}) => {
  const query = new URLSearchParams();

  if (filters.status) query.set('status', filters.status);
  if (filters.targetType) query.set('targetType', filters.targetType);

  const serialized = query.toString();
  return `/api/v1/admin/reports${serialized ? `?${serialized}` : ''}`;
};

const resolve = async (
  id: number,
  action: 'confirm' | 'reject' | 'dismiss',
  resolutionNote?: string,
): Promise<ModerationReport> => {
  const response = await api.post<ApiEnvelope<ModerationReport>>(
    `/api/v1/admin/reports/${id}/${action}`,
    { resolutionNote: resolutionNote?.trim() || null },
  );

  return unwrap(response);
};

export const reportService = {
  async getReports(filters: ReportFilters = {}): Promise<ModerationReport[]> {
    const response = await api.get<ApiEnvelope<ModerationReport[]> | ModerationReport[]>(buildReportsUrl(filters));
    return unwrap(response) ?? [];
  },

  confirmReport: (id: number, resolutionNote?: string) => resolve(id, 'confirm', resolutionNote),
  rejectReport: (id: number, resolutionNote?: string) => resolve(id, 'reject', resolutionNote),
  dismissReport: (id: number, resolutionNote?: string) => resolve(id, 'dismiss', resolutionNote),
};
