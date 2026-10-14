import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { OpportunityDetailPage } from './OpportunityDetailPage';
import { OpportunityListPage } from './OpportunityListPage';
import type { OpportunityDetail } from './opportunityAdminService';

const serviceMocks = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), approve: vi.fn(), reject: vi.fn(), transitionFunding: vi.fn() }));
vi.mock('./opportunityAdminService', async () => {
  const actual = await vi.importActual<typeof import('./opportunityAdminService')>('./opportunityAdminService');
  return { ...actual, opportunityAdminService: serviceMocks };
});
vi.mock('@/context/AuthContext', () => ({ usePermissions: () => ({ permissions: ['FOPX.Opportunities.Review'], isAuthenticated: true }) }));
vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key, i18n: { language: 'en' } }),
}));

const detail = (overrides: Partial<OpportunityDetail> = {}): OpportunityDetail => ({
  id: 12, title: 'Solar Opportunity', projectId: 9, projectDisplayName: 'Solar Project', founderId: 'founder-1', founder: { id: 'founder-1', name: 'Founder One', email: 'founder@example.com' }, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z', status: 'UnderReview', moderationStatus: 'UnderReview', fundingStatus: 'NotScheduled', fundingTarget: 1000, fundingCurrency: 'USD', projectStage: 'Startup',
  sequenceNumber: 1, projectSummary: 'Project summary', projectDescription: null, projectIndustry: 'Energy', description: 'Description', shortDescription: 'Short', useOfFunds: 'Operations', fundingOpensAt: null, fundingClosesAt: null, closedAt: null, closureReason: null, fundedAmount: 0, committedAmount: 0, confirmedReceivedAmount: 0, remainingFundingAmount: 1000, fundingProgress: 0, fundingProgressPercent: 0, approvedParticipantCount: 0, coverImageUrl: null, projectContext: { id: 9, displayName: 'Solar Project', summary: 'Project summary', description: '', industry: 'Energy', projectStage: 'Startup', status: 'Draft', logoUrl: null }, media: [], documents: [], events: [], reviewHistory: [], ...overrides,
});

describe('Opportunity admin pages', () => {
  beforeEach(() => vi.resetAllMocks());

  it('renders the authoritative empty list state', async () => {
    serviceMocks.list.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.opportunities.emptyTitle')).toBeInTheDocument();
  });

  it('renders a controlled 403 list state', async () => {
    serviceMocks.list.mockRejectedValue(new ApiError(403, 'forbidden'));
    render(<MemoryRouter><OpportunityListPage /></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.opportunities.errors.forbiddenTitle')).toBeInTheDocument();
  });

  it('renders a controlled 404 detail state', async () => {
    serviceMocks.get.mockRejectedValue(new ApiError(404, 'missing'));
    render(<MemoryRouter initialEntries={['/admin/fopx/opportunities/12']}><Routes><Route path="/admin/fopx/opportunities/:opportunityId" element={<OpportunityDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.opportunities.errors.notFoundTitle')).toBeInTheDocument();
  });

  it('refreshes authoritative detail after approval', async () => {
    const current = detail();
    serviceMocks.get.mockResolvedValueOnce(current).mockResolvedValueOnce(detail({ status: 'Approved', moderationStatus: 'Approved' }));
    serviceMocks.approve.mockResolvedValue(current);
    render(<MemoryRouter initialEntries={['/admin/fopx/opportunities/12']}><Routes><Route path="/admin/fopx/opportunities/:opportunityId" element={<OpportunityDetailPage />} /></Routes></MemoryRouter>);
    const user = userEvent.setup();
    await screen.findByText('Solar Opportunity');
    await user.click(screen.getByRole('button', { name: 'centralAdmin.opportunities.actions.approve' }));
    await user.click(screen.getByRole('button', { name: 'centralAdmin.opportunities.actions.confirm' }));
    expect(serviceMocks.approve).toHaveBeenCalledWith(12);
    expect(serviceMocks.get).toHaveBeenCalledTimes(2);
    expect((await screen.findAllByText('Approved')).length).toBeGreaterThan(0);
  });
});
