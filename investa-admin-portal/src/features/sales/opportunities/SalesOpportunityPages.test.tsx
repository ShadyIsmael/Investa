import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { getCanonicalRoute } from '@/core/routeRegistry';
import { SalesOpportunityDetailPage } from './SalesOpportunityDetailPage';
import { SalesOpportunityFormPage } from './SalesOpportunityFormPage';
import { SalesOpportunityListPage } from './SalesOpportunityListPage';

const mocks = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), setStage: vi.fn(), won: vi.fn(), lost: vi.fn(), customers: vi.fn(), contacts: vi.fn(), catalog: vi.fn(), owners: vi.fn() }));
vi.mock('./salesOpportunityService', async () => { const actual = await vi.importActual<typeof import('./salesOpportunityService')>('./salesOpportunityService'); return { ...actual, salesOpportunityService: mocks }; });
vi.mock('@/context/AuthContext', () => ({ usePermissions: () => ({ permissions: ['Company.Sales.Opportunities.View', 'Company.Sales.Opportunities.Create', 'Company.Sales.Opportunities.Edit', 'Company.Sales.Opportunities.Manage'], isAuthenticated: true, hasPermission: (value: string) => value.startsWith('Company.Sales.Opportunities'), hasAnyPermission: (...values: string[]) => values.some(value => value.startsWith('Company.Sales.Opportunities')), hasAllPermissions: (...values: string[]) => values.every(value => value.startsWith('Company.Sales.Opportunities')) }) }));
vi.mock('react-i18next', async () => ({ ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')), useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key, i18n: { language: 'en' } }) }));

const opportunity = (overrides: Record<string, unknown> = {}) => ({ id: 'opp-1', opportunityCode: 'SAL-000001', title: 'Expansion', customerId: 'customer-1', customerCode: 'CUS-000001', customerDisplayName: 'Acme', stage: 'Qualified' as const, status: 'Open' as const, interestedItems: [{ id: 'interest-1', catalogItemId: 'catalog-1', code: 'CAT-000001', name: 'Support', type: 'Service' as const }], expectedValue: 1000, currency: 'EGP', probability: 40, expectedCloseDate: '2026-12-01', salesOwnerUserId: null, salesOwnerName: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z', primaryContactId: null, primaryContactName: null, source: 'Referral' as const, description: 'Description', notes: 'Notes', lostReason: null, wonAt: null, lostAt: null, ...overrides });

describe('Company Sales Opportunity pages', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('renders a server-backed list with stage and status filters', async () => {
    mocks.list.mockResolvedValue({ page: 1, pageSize: 20, total: 1, items: [opportunity()] });
    render(<MemoryRouter><SalesOpportunityListPage /></MemoryRouter>);
    expect(await screen.findByText('Expansion')).toBeInTheDocument();
    expect(screen.getByText('SAL-000001')).toBeInTheDocument();
    expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }));
  });

  it('validates the customer relationship before creating', async () => {
    mocks.customers.mockResolvedValue([]); mocks.catalog.mockResolvedValue([]); mocks.owners.mockResolvedValue([]);
    render(<MemoryRouter><SalesOpportunityFormPage /></MemoryRouter>);
    await screen.findByText('centralAdmin.salesOpportunities.form.title');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/centralAdmin\.salesOpportunities\.form\.title/), 'Expansion');
    await user.click(screen.getByRole('button', { name: 'centralAdmin.salesOpportunities.actions.save' }));
    expect(await screen.findByText('centralAdmin.salesOpportunities.validation.customer')).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('loads dependent customer contacts and catalog interest choices', async () => {
    mocks.customers.mockResolvedValue([{ id: 'customer-1', customerCode: 'CUS-000001', displayName: 'Acme' }]); mocks.contacts.mockResolvedValue([{ id: 'contact-1', name: 'Sam', email: 'sam@example.com' }]); mocks.catalog.mockResolvedValue([{ id: 'catalog-1', code: 'CAT-000001', name: 'Support', type: 'Service' }]); mocks.owners.mockResolvedValue([]);
    render(<MemoryRouter><SalesOpportunityFormPage /></MemoryRouter>);
    const user = userEvent.setup();
    await user.selectOptions(await screen.findByLabelText(/centralAdmin\.salesOpportunities\.form\.customer/), 'customer-1');
    expect(await screen.findByText('Sam — sam@example.com')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders terminal detail actions and keeps the FOPX boundary separate', async () => {
    mocks.get.mockResolvedValue(opportunity());
    render(<MemoryRouter initialEntries={['/admin/sales/opportunities/opp-1']}><Routes><Route path="/admin/sales/opportunities/:opportunityId" element={<SalesOpportunityDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Expansion' })).toBeInTheDocument();
    expect(screen.getByText('centralAdmin.salesOpportunities.actions.markWon')).toBeInTheDocument();
    expect(getCanonicalRoute('/admin/sales/opportunities')?.component).toBe('SalesOpportunityListPage');
    expect(getCanonicalRoute('/admin/fopx/opportunities')?.ownership).toBe('fopx');
    mocks.get.mockRejectedValueOnce(new ApiError(404, 'missing'));
    render(<MemoryRouter initialEntries={['/admin/sales/opportunities/missing']}><Routes><Route path="/admin/sales/opportunities/:opportunityId" element={<SalesOpportunityDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.salesOpportunities.errors.notFoundTitle')).toBeInTheDocument();
  });
});
