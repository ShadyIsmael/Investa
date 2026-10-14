import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { GlobalOverview } from './GlobalOverview';

const mocks = vi.hoisted(() => ({
  customers: vi.fn(),
  catalog: vi.fn(),
  opportunities: vi.fn(),
  quotations: vi.fn(),
  contracts: vi.fn(),
  fopx: vi.fn(),
}));

vi.mock('@/features/customers/customerService', () => ({ customerService: { list: mocks.customers } }));
vi.mock('@/features/catalog/catalogService', () => ({ catalogService: { list: mocks.catalog } }));
vi.mock('@/features/sales/opportunities/salesOpportunityService', () => ({
  salesOpportunityService: { list: mocks.opportunities },
}));
vi.mock('@/features/sales/quotations/quotationService', () => ({ quotationService: { list: mocks.quotations } }));
vi.mock('@/features/sales/contracts/contractService', () => ({ contractService: { list: mocks.contracts } }));
vi.mock('@/features/fopx-opportunities/opportunityAdminService', () => ({
  opportunityAdminService: { list: mocks.fopx },
}));

vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'centralAdmin.globalOverview.subCount') return `${options?.value} ${options?.state}`;
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

describe('Company Overview home with real data', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders live totals from the company modules instead of placeholders', async () => {
    mocks.customers.mockResolvedValue({ items: [], total: 7, page: 1, pageSize: 1 });
    mocks.catalog.mockResolvedValue({ items: [], total: 3, page: 1, pageSize: 1 });
    mocks.opportunities.mockImplementation(async (query: { stage?: string; status?: string }) => {
      if (query.stage === 'New') return { items: [], total: 2, page: 1, pageSize: 1 };
      if (query.stage === 'Qualified') return { items: [], total: 3, page: 1, pageSize: 1 };
      if (query.stage === 'Proposal') return { items: [], total: 1, page: 1, pageSize: 1 };
      if (query.stage === 'Negotiation') return { items: [], total: 4, page: 1, pageSize: 1 };
      if (query.status === 'Won') return { items: [], total: 6, page: 1, pageSize: 1 };
      if (query.status === 'Lost') return { items: [], total: 1, page: 1, pageSize: 1 };
      if (query.status === 'Open') return { items: [], total: 9, page: 1, pageSize: 1 };
      return { items: [], total: 12, page: 1, pageSize: 1 };
    });
    mocks.quotations.mockResolvedValue({ items: [], total: 4, page: 1, pageSize: 1 });
    mocks.contracts.mockResolvedValue({ items: [], total: 6, page: 1, pageSize: 1 });
    mocks.fopx.mockResolvedValue({ items: [], total: 9, page: 1, pageSize: 1 });

    render(
      <MemoryRouter>
        <GlobalOverview />
      </MemoryRouter>,
    );

    await waitFor(() => expect(mocks.customers).toHaveBeenCalled());
    for (const value of ['7', '3', '12', '4', '6', '9']) {
      expect(await screen.findAllByText(value)).not.toHaveLength(0);
    }
    const moduleLinks = screen.getAllByRole('link', { name: /centralAdmin.globalOverview.openModule/ });
    expect(moduleLinks.map(link => link.getAttribute('href'))).toEqual(
      expect.arrayContaining(['/admin/customers', '/admin/sales/quotations', '/admin/sales/contracts']),
    );
    expect(screen.queryByText('centralAdmin.globalOverview.notAvailable')).not.toBeInTheDocument();
  });

  it('renders the live pipeline chart grouped by stage with outcomes', async () => {
    mocks.customers.mockResolvedValue({ items: [], total: 7, page: 1, pageSize: 1 });
    mocks.catalog.mockResolvedValue({ items: [], total: 3, page: 1, pageSize: 1 });
    mocks.opportunities.mockImplementation(async (query: { stage?: string; status?: string }) => {
      if (query.stage === 'New') return { items: [], total: 2, page: 1, pageSize: 1 };
      if (query.stage === 'Qualified') return { items: [], total: 3, page: 1, pageSize: 1 };
      if (query.stage === 'Proposal') return { items: [], total: 1, page: 1, pageSize: 1 };
      if (query.stage === 'Negotiation') return { items: [], total: 4, page: 1, pageSize: 1 };
      if (query.status === 'Won') return { items: [], total: 6, page: 1, pageSize: 1 };
      if (query.status === 'Lost') return { items: [], total: 1, page: 1, pageSize: 1 };
      return { items: [], total: 12, page: 1, pageSize: 1 };
    });
    mocks.quotations.mockResolvedValue({ items: [], total: 4, page: 1, pageSize: 1 });
    mocks.contracts.mockResolvedValue({ items: [], total: 6, page: 1, pageSize: 1 });
    mocks.fopx.mockResolvedValue({ items: [], total: 9, page: 1, pageSize: 1 });

    render(
      <MemoryRouter>
        <GlobalOverview />
      </MemoryRouter>,
    );

    expect(await screen.findByText('centralAdmin.globalOverview.pipelineTitle')).toBeInTheDocument();
    expect(await screen.findByText('centralAdmin.salesOpportunities.stages.Negotiation')).toBeInTheDocument();
    expect(await screen.findByText('centralAdmin.salesOpportunities.statuses.Won')).toBeInTheDocument();
    expect(await screen.findByText('centralAdmin.salesOpportunities.statuses.Lost')).toBeInTheDocument();
    for (const value of ['2', '4', '6']) {
      expect(await screen.findAllByText(value)).not.toHaveLength(0);
    }
  });

  it('hides modules the user cannot access instead of showing zeros', async () => {
    const denied = new ApiError(403, 'forbidden');
    mocks.customers.mockRejectedValue(denied);
    mocks.catalog.mockRejectedValue(denied);
    mocks.opportunities.mockRejectedValue(denied);
    mocks.quotations.mockRejectedValue(denied);
    mocks.contracts.mockRejectedValue(denied);
    mocks.fopx.mockRejectedValue(denied);

    render(
      <MemoryRouter>
        <GlobalOverview />
      </MemoryRouter>,
    );

    expect(await screen.findByText('centralAdmin.globalOverview.noAccess')).toBeInTheDocument();
    expect(screen.queryByText('centralAdmin.globalOverview.pipelineTitle')).not.toBeInTheDocument();
  });

  it('recovers through retry when the live figures fail to load', async () => {
    mocks.customers.mockRejectedValueOnce(new Error('network down'));
    mocks.catalog.mockResolvedValue({ items: [], total: 3, page: 1, pageSize: 1 });
    mocks.opportunities.mockResolvedValue({ items: [], total: 5, page: 1, pageSize: 1 });
    mocks.quotations.mockResolvedValue({ items: [], total: 4, page: 1, pageSize: 1 });
    mocks.contracts.mockResolvedValue({ items: [], total: 6, page: 1, pageSize: 1 });
    mocks.fopx.mockResolvedValue({ items: [], total: 9, page: 1, pageSize: 1 });

    render(
      <MemoryRouter>
        <GlobalOverview />
      </MemoryRouter>,
    );

    expect(await screen.findByText('centralAdmin.globalOverview.metricsError')).toBeInTheDocument();
    mocks.customers.mockResolvedValue({ items: [], total: 7, page: 1, pageSize: 1 });
    await userEvent.setup().click(screen.getByRole('button', { name: 'centralAdmin.globalOverview.retry' }));
    expect(await screen.findAllByText('7')).not.toHaveLength(0);
  });
});
