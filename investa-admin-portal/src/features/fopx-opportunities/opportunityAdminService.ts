import { api } from '@/services/api';

export const OPPORTUNITY_ADMIN_PERMISSIONS = {
  view: 'FOPX.Opportunities.View',
  review: 'FOPX.Opportunities.Review',
  manage: 'FOPX.Opportunities.Manage',
} as const;

export const OPPORTUNITY_STATUSES = [
  'Draft', 'UnderReview', 'Rejected', 'Approved', 'Published', 'Funding',
  'FullyFunded', 'InProgress', 'Completed', 'Archived',
] as const;

export const OPPORTUNITY_MODERATION_STATUSES = [
  'Draft', 'Submitted', 'UnderReview', 'Approved', 'ChangesRequested', 'Rejected',
] as const;

export const OPPORTUNITY_FUNDING_STATUSES = ['NotScheduled', 'Scheduled', 'Open', 'Paused', 'Closed'] as const;
export const OPPORTUNITY_CLOSURE_REASONS = ['TargetReached', 'DeadlineReached', 'FounderClosed', 'Cancelled', 'ComplianceClosed'] as const;

export type OpportunityStatus = typeof OPPORTUNITY_STATUSES[number];
export type OpportunityModerationStatus = typeof OPPORTUNITY_MODERATION_STATUSES[number];
export type OpportunityFundingStatus = typeof OPPORTUNITY_FUNDING_STATUSES[number];
export type OpportunityClosureReason = typeof OPPORTUNITY_CLOSURE_REASONS[number];

export interface FounderSummary {
  id: string;
  name: string;
  email: string | null;
}

export interface OpportunityListItem {
  id: number;
  title: string;
  projectId: number;
  projectDisplayName: string | null;
  founderId: string;
  founder: FounderSummary;
  createdAt: string;
  updatedAt: string;
  status: OpportunityStatus;
  moderationStatus: OpportunityModerationStatus;
  fundingStatus: OpportunityFundingStatus;
  fundingTarget: number;
  fundingCurrency: string;
  projectStage: string;
}

export interface OpportunityProjectContext {
  id: number;
  displayName: string;
  summary: string;
  description: string;
  industry: string | null;
  projectStage: string;
  status: string;
  logoUrl: string | null;
}

export interface OpportunityMedia {
  id: number;
  fileName: string;
  fileUrl: string;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  mediaType: string;
  mimeType: string | null;
  isCover: boolean;
  isPublic: boolean;
  createdAt: string;
}

export interface OpportunityDocument {
  id: number;
  fileName: string;
  fileUrl: string;
  previewUrl: string | null;
  documentType: string;
  visibility: string;
  category: string | null;
  createdAt: string;
}

export interface OpportunityEvent {
  id: number;
  eventType: string;
  title: string;
  description: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  isPublic: boolean;
}

export interface OpportunityDetail extends OpportunityListItem {
  projectId: number;
  sequenceNumber: number;
  projectDisplayName: string | null;
  projectSummary: string | null;
  projectDescription: string | null;
  projectIndustry: string | null;
  description: string | null;
  shortDescription: string | null;
  useOfFunds: string | null;
  fundingCurrency: string;
  moderationStatus: OpportunityModerationStatus;
  fundingStatus: OpportunityFundingStatus;
  fundingOpensAt: string | null;
  fundingClosesAt: string | null;
  closedAt: string | null;
  closureReason: OpportunityClosureReason | null;
  fundedAmount: number;
  committedAmount: number;
  confirmedReceivedAmount: number;
  remainingFundingAmount: number;
  fundingProgress: number;
  fundingProgressPercent: number;
  approvedParticipantCount: number;
  coverImageUrl: string | null;
  updatedAt: string;
  projectContext: OpportunityProjectContext | null;
  media: OpportunityMedia[];
  documents: OpportunityDocument[];
  events: OpportunityEvent[];
  reviewHistory: OpportunityEvent[];
}

export interface OpportunityListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: OpportunityStatus;
  moderationStatus?: OpportunityModerationStatus;
  fundingStatus?: OpportunityFundingStatus;
  projectId?: number;
  founderId?: string;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'status' | 'moderation' | 'funding' | 'fundingTarget' | 'projectStage' | 'project' | 'founder';
  sortDirection: 'asc' | 'desc';
}

export interface OpportunityListResult {
  items: OpportunityListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransitionFundingInput {
  targetStatus: OpportunityFundingStatus;
  fundingOpensAt?: string;
  fundingClosesAt?: string;
  closureReason?: OpportunityClosureReason;
  reason?: string;
}

type JsonObject = Record<string, unknown>;

const STATUS_BY_NUMBER: Record<number, OpportunityStatus> = {
  1: 'Draft', 2: 'UnderReview', 3: 'Rejected', 4: 'Approved', 5: 'Published',
  6: 'Funding', 7: 'FullyFunded', 8: 'InProgress', 9: 'Completed', 10: 'Archived',
};
const MODERATION_BY_NUMBER: Record<number, OpportunityModerationStatus> = {
  0: 'Draft', 1: 'Submitted', 2: 'UnderReview', 3: 'Approved', 4: 'ChangesRequested', 5: 'Rejected',
};
const FUNDING_BY_NUMBER: Record<number, OpportunityFundingStatus> = {
  0: 'NotScheduled', 1: 'Scheduled', 2: 'Open', 3: 'Paused', 4: 'Closed',
};
const CLOSURE_BY_NUMBER: Record<number, OpportunityClosureReason> = {
  1: 'TargetReached', 2: 'DeadlineReached', 3: 'FounderClosed', 4: 'Cancelled', 5: 'ComplianceClosed',
};

const asObject = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const field = (value: unknown, name: string): unknown => {
  const object = asObject(value);
  return object[name] ?? object[name[0].toUpperCase() + name.slice(1)];
};
const stringValue = (value: unknown, fallback = ''): string => typeof value === 'string' ? value : value == null ? fallback : String(value);
const nullableString = (value: unknown): string | null => value == null || value === '' ? null : stringValue(value);
const numberValue = (value: unknown, fallback = 0): number => typeof value === 'number' && Number.isFinite(value) ? value : Number.isFinite(Number(value)) ? Number(value) : fallback;
const booleanValue = (value: unknown, fallback = false): boolean => typeof value === 'boolean' ? value : value == null ? fallback : Boolean(value);
const arrayValue = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

function enumValue<T extends string>(value: unknown, names: readonly T[], byNumber: Record<number, T>, fallback: T): T {
  if (typeof value === 'number') return byNumber[value] ?? fallback;
  const candidate = stringValue(value);
  return names.find(name => name.toLowerCase() === candidate.toLowerCase()) ?? fallback;
}

const mapFounder = (value: unknown): FounderSummary => ({
  id: stringValue(field(value, 'id')),
  name: stringValue(field(value, 'name'), '—'),
  email: nullableString(field(value, 'email')),
});

export const mapOpportunityListItem = (value: unknown): OpportunityListItem => ({
  id: numberValue(field(value, 'id')),
  title: stringValue(field(value, 'title'), '—'),
  projectId: numberValue(field(value, 'projectId')),
  projectDisplayName: nullableString(field(value, 'projectDisplayName')),
  founderId: stringValue(field(value, 'founderId')) || stringValue(field(field(value, 'founder'), 'id')),
  founder: mapFounder(field(value, 'founder')),
  createdAt: stringValue(field(value, 'createdAt')),
  updatedAt: stringValue(field(value, 'updatedAt')),
  status: enumValue(field(value, 'status'), OPPORTUNITY_STATUSES, STATUS_BY_NUMBER, 'Draft'),
  moderationStatus: enumValue(field(value, 'moderationStatus'), OPPORTUNITY_MODERATION_STATUSES, MODERATION_BY_NUMBER, 'Draft'),
  fundingStatus: enumValue(field(value, 'fundingStatus'), OPPORTUNITY_FUNDING_STATUSES, FUNDING_BY_NUMBER, 'NotScheduled'),
  fundingTarget: numberValue(field(value, 'fundingTarget')),
  fundingCurrency: stringValue(field(value, 'fundingCurrency'), '—'),
  projectStage: enumValue(field(value, 'projectStage'), ['Idea', 'MVP', 'Startup', 'Scaling', 'Established', 'Other'] as const, { 1: 'Idea', 2: 'MVP', 3: 'Startup', 4: 'Scaling', 5: 'Established', 6: 'Other' }, 'Other'),
});

const mapProjectContext = (value: unknown): OpportunityProjectContext | null => {
  if (!value || typeof value !== 'object') return null;
  return {
    id: numberValue(field(value, 'id')),
    displayName: stringValue(field(value, 'displayName'), '—'),
    summary: stringValue(field(value, 'summary')),
    description: stringValue(field(value, 'description')),
    industry: nullableString(field(value, 'industry')),
    projectStage: stringValue(field(value, 'projectStage'), '—'),
    status: stringValue(field(value, 'status'), '—'),
    logoUrl: nullableString(field(value, 'logoUrl')),
  };
};

const mapMedia = (value: unknown): OpportunityMedia => ({
  id: numberValue(field(value, 'id')),
  fileName: stringValue(field(value, 'fileName'), '—'),
  fileUrl: stringValue(field(value, 'fileUrl')),
  previewUrl: nullableString(field(value, 'previewUrl')),
  thumbnailUrl: nullableString(field(value, 'thumbnailUrl')),
  mediaType: stringValue(field(value, 'mediaType'), stringValue(field(value, 'fileType'), '—')),
  mimeType: nullableString(field(value, 'mimeType')),
  isCover: booleanValue(field(value, 'isCover')),
  isPublic: booleanValue(field(value, 'isPublic')),
  createdAt: stringValue(field(value, 'createdAt')),
});

const mapDocument = (value: unknown): OpportunityDocument => ({
  id: numberValue(field(value, 'id')),
  fileName: stringValue(field(value, 'fileName'), '—'),
  fileUrl: stringValue(field(value, 'fileUrl')),
  previewUrl: nullableString(field(value, 'previewUrl')),
  documentType: stringValue(field(value, 'documentType'), '—'),
  visibility: stringValue(field(value, 'visibility'), '—'),
  category: nullableString(field(value, 'category')),
  createdAt: stringValue(field(value, 'createdAt')),
});

const mapEvent = (value: unknown): OpportunityEvent => ({
  id: numberValue(field(value, 'id')),
  eventType: stringValue(field(value, 'eventType'), 'Event'),
  title: stringValue(field(value, 'title'), 'Event'),
  description: nullableString(field(value, 'description')),
  oldValue: nullableString(field(value, 'oldValue')),
  newValue: nullableString(field(value, 'newValue')),
  createdAt: stringValue(field(value, 'createdAt')),
  isPublic: booleanValue(field(value, 'isPublic')),
});

export const mapOpportunityDetail = (value: unknown): OpportunityDetail => {
  const base = mapOpportunityListItem(value);
  return {
    ...base,
    projectId: numberValue(field(value, 'projectId')),
    sequenceNumber: numberValue(field(value, 'sequenceNumber')),
    projectDisplayName: nullableString(field(value, 'projectDisplayName')),
    projectSummary: nullableString(field(value, 'projectSummary')),
    projectDescription: nullableString(field(value, 'projectDescription')),
    projectIndustry: nullableString(field(value, 'projectIndustry')),
    description: nullableString(field(value, 'description')),
    shortDescription: nullableString(field(value, 'shortDescription')),
    useOfFunds: nullableString(field(value, 'useOfFunds')),
    fundingCurrency: stringValue(field(value, 'fundingCurrency'), '—'),
    moderationStatus: enumValue(field(value, 'moderationStatus'), OPPORTUNITY_MODERATION_STATUSES, MODERATION_BY_NUMBER, 'Draft'),
    fundingStatus: enumValue(field(value, 'fundingStatus'), OPPORTUNITY_FUNDING_STATUSES, FUNDING_BY_NUMBER, 'NotScheduled'),
    fundingOpensAt: nullableString(field(value, 'fundingOpensAt')),
    fundingClosesAt: nullableString(field(value, 'fundingClosesAt')),
    closedAt: nullableString(field(value, 'closedAt')),
    closureReason: field(value, 'closureReason') == null ? null : enumValue(field(value, 'closureReason'), OPPORTUNITY_CLOSURE_REASONS, CLOSURE_BY_NUMBER, 'Cancelled'),
    fundedAmount: numberValue(field(value, 'fundedAmount')),
    committedAmount: numberValue(field(value, 'committedAmount')),
    confirmedReceivedAmount: numberValue(field(value, 'confirmedReceivedAmount')),
    remainingFundingAmount: numberValue(field(value, 'remainingFundingAmount')),
    fundingProgress: numberValue(field(value, 'fundingProgress')),
    fundingProgressPercent: numberValue(field(value, 'fundingProgressPercent')),
    approvedParticipantCount: numberValue(field(value, 'approvedParticipantCount')),
    coverImageUrl: nullableString(field(value, 'coverImageUrl')),
    updatedAt: stringValue(field(value, 'updatedAt')),
    projectContext: mapProjectContext(field(value, 'projectContext')),
    media: arrayValue(field(value, 'media')).map(mapMedia),
    documents: arrayValue(field(value, 'documents')).map(mapDocument),
    events: arrayValue(field(value, 'events')).map(mapEvent),
    reviewHistory: arrayValue(field(value, 'reviewHistory')).map(mapEvent),
  };
};

const unwrapData = (value: unknown): unknown => field(value, 'data') ?? value;

export const mapOpportunityListResponse = (value: unknown): OpportunityListResult => {
  const payload = asObject(unwrapData(value));
  const items = arrayValue(field(payload, 'items')).map(mapOpportunityListItem);
  return {
    items,
    total: numberValue(field(payload, 'total')),
    page: numberValue(field(payload, 'page'), 1),
    pageSize: numberValue(field(payload, 'pageSize'), 20),
  };
};

export const opportunityAdminService = {
  async list(query: OpportunityListQuery): Promise<OpportunityListResult> {
    const params = new URLSearchParams({
      page: String(query.page),
      pageSize: String(query.pageSize),
      sortBy: query.sortBy,
      sortDirection: query.sortDirection,
    });
    if (query.search?.trim()) params.set('search', query.search.trim());
    if (query.status) params.set('status', query.status);
    if (query.moderationStatus) params.set('moderationStatus', query.moderationStatus);
    if (query.fundingStatus) params.set('fundingStatus', query.fundingStatus);
    if (query.projectId != null) params.set('projectId', String(query.projectId));
    if (query.founderId?.trim()) params.set('founderId', query.founderId.trim());
    if (query.createdFrom) params.set('createdFrom', query.createdFrom);
    if (query.createdTo) params.set('createdTo', query.createdTo);
    if (query.updatedFrom) params.set('updatedFrom', query.updatedFrom);
    if (query.updatedTo) params.set('updatedTo', query.updatedTo);
    const response = await api.get<unknown>(`/api/v1/admin/opportunities?${params.toString()}`);
    return mapOpportunityListResponse(response);
  },

  async get(id: number): Promise<OpportunityDetail> {
    const response = await api.get<unknown>(`/api/v1/admin/opportunities/${id}`);
    return mapOpportunityDetail(unwrapData(response));
  },

  async approve(id: number): Promise<OpportunityDetail> {
    const response = await api.post<unknown>(`/api/v1/admin/opportunities/${id}/approve`, {});
    return mapOpportunityDetail(unwrapData(response));
  },

  async reject(id: number, reason: string): Promise<OpportunityDetail> {
    const response = await api.post<unknown>(`/api/v1/admin/opportunities/${id}/reject`, { reason });
    return mapOpportunityDetail(unwrapData(response));
  },

  async transitionFunding(id: number, input: TransitionFundingInput): Promise<OpportunityDetail> {
    const response = await api.post<unknown>(`/api/v1/admin/opportunities/${id}/funding-status`, {
      targetStatus: input.targetStatus,
      fundingOpensAt: input.fundingOpensAt || null,
      fundingClosesAt: input.fundingClosesAt || null,
      closureReason: input.closureReason || null,
      reason: input.reason?.trim() || null,
    });
    return mapOpportunityDetail(unwrapData(response));
  },
};
