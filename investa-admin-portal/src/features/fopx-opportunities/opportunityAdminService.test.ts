import { describe, expect, it, vi } from 'vitest';

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/services/api', () => ({ api: apiMocks }));

import { mapOpportunityListResponse, opportunityAdminService } from './opportunityAdminService';

describe('opportunityAdminService', () => {
  it('parses the SuccessResponse paging envelope and authoritative list fields', () => {
    const result = mapOpportunityListResponse({ data: { Items: [{ Id: 12, Title: 'Solar', ProjectId: 9, ProjectDisplayName: 'Solar Project', FounderId: 'f-1', Founder: { Id: 'f-1', Name: 'Founder' }, CreatedAt: '2026-01-01T00:00:00Z', UpdatedAt: '2026-01-02T00:00:00Z', Status: 2, ModerationStatus: 2, FundingStatus: 0, FundingTarget: 5000, FundingCurrency: 'USD', ProjectStage: 3 }], Total: 1, Page: 2, PageSize: 20 } });
    expect(result).toEqual(expect.objectContaining({ total: 1, page: 2, pageSize: 20 }));
    expect(result.items[0]).toMatchObject({ id: 12, title: 'Solar', projectId: 9, projectDisplayName: 'Solar Project', founderId: 'f-1', founder: { id: 'f-1', name: 'Founder' }, status: 'UnderReview', moderationStatus: 'UnderReview', fundingStatus: 'NotScheduled', fundingCurrency: 'USD', projectStage: 'Startup' });
  });

  it('forwards server pagination, search, status, and sorting', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { items: [], total: 0, page: 3, pageSize: 50 } });
    await opportunityAdminService.list({ page: 3, pageSize: 50, search: 'solar founder', status: 'UnderReview', sortBy: 'title', sortDirection: 'asc' });
    expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/admin/opportunities?page=3&pageSize=50&sortBy=title&sortDirection=asc&search=solar+founder&status=UnderReview');
  });

  it('forwards the hardened filter contract including exclusive date bounds', async () => {
    apiMocks.get.mockResolvedValueOnce({ data: { items: [], total: 0, page: 1, pageSize: 20 } });
    await opportunityAdminService.list({ page: 1, pageSize: 20, moderationStatus: 'UnderReview', fundingStatus: 'Open', projectId: 9, founderId: 'f-1', createdFrom: '2026-01-01', createdTo: '2026-02-01', updatedFrom: '2026-01-02', updatedTo: '2026-02-02', sortBy: 'updatedAt', sortDirection: 'desc' });
    expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/admin/opportunities?page=1&pageSize=20&sortBy=updatedAt&sortDirection=desc&moderationStatus=UnderReview&fundingStatus=Open&projectId=9&founderId=f-1&createdFrom=2026-01-01&createdTo=2026-02-01&updatedFrom=2026-01-02&updatedTo=2026-02-02');
  });

  it('uses the Opportunity admin detail and action endpoints, preserving the Project relation', async () => {
    const detail = { data: { Id: 12, Title: 'Solar', ProjectId: 9, ProjectContext: { Id: 9, DisplayName: 'Project Solar' }, Founder: { Id: 'f-1', Name: 'Founder' }, Status: 'UnderReview', ModerationStatus: 'UnderReview', FundingStatus: 'NotScheduled', ReviewHistory: [] } };
    apiMocks.get.mockResolvedValueOnce(detail).mockResolvedValueOnce(detail);
    apiMocks.post.mockResolvedValueOnce(detail).mockResolvedValueOnce(detail);
    const loaded = await opportunityAdminService.get(12);
    await opportunityAdminService.approve(12);
    await opportunityAdminService.reject(12, 'Insufficient evidence');
    expect(loaded.projectContext?.displayName).toBe('Project Solar');
    expect(apiMocks.get).toHaveBeenCalledWith('/api/v1/admin/opportunities/12');
    expect(apiMocks.post).toHaveBeenNthCalledWith(1, '/api/v1/admin/opportunities/12/approve', {});
    expect(apiMocks.post).toHaveBeenNthCalledWith(2, '/api/v1/admin/opportunities/12/reject', { reason: 'Insufficient evidence' });
  });
});
