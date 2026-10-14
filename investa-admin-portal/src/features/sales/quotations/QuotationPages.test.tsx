import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuotationDetailPage } from './QuotationDetailPage';
import { QuotationFormPage } from './QuotationFormPage';
import { QuotationListPage } from './QuotationListPage';
import { calculateQuotationPreview, type QuotationDetail } from './quotationService';

const mocks = vi.hoisted(() => ({
  quotationService: {
    list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), send: vi.fn(), accept: vi.fn(), reject: vi.fn(),
    customers: vi.fn(), contacts: vi.fn(), opportunities: vi.fn(), catalog: vi.fn(), currencies: vi.fn(),
  },
}));

vi.mock('./quotationService', async () => {
  const actual = await vi.importActual<typeof import('./quotationService')>('./quotationService');
  return { ...actual, quotationService: mocks.quotationService };
});
vi.mock('../opportunities/salesOpportunityService', () => ({ salesOpportunityService: {} }));
vi.mock('@/context/AuthContext', () => ({
  usePermissions: () => ({
    permissions: ['Company.Sales.Quotations.View', 'Company.Sales.Quotations.Create', 'Company.Sales.Quotations.Edit', 'Company.Sales.Quotations.Manage'],
    isAuthenticated: true,
    hasPermission: (value: string) => value.startsWith('Company.Sales.Quotations'),
    hasAnyPermission: (...values: string[]) => values.some(value => value.startsWith('Company.Sales.Quotations')),
    hasAllPermissions: (...values: string[]) => values.every(value => value.startsWith('Company.Sales.Quotations')),
  }),
}));
vi.mock('react-i18next', async () => ({
  ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')),
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key, i18n: { language: 'en' } }),
}));

const detail = (status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' = 'Draft'): QuotationDetail => ({
  id: 'quotation-1', quotationNumber: 'QTN-000001', customerId: 'customer-1', customerCode: 'CUS-000001', customerName: 'Acme',
  salesOpportunityId: 'opportunity-1', salesOpportunityCode: 'SAL-000001', salesOpportunityTitle: 'Expansion', status,
  issueDate: '2026-10-01', validUntil: '2026-10-31', isExpired: false, currency: 'EGP', subtotal: 100, discountTotal: 10,
  taxTotal: 18, grandTotal: 108, updatedAt: '2026-10-01T10:00:00Z', contactId: 'contact-1', contactName: 'Sam', contactEmail: 'sam@example.com',
  contactPhone: null, customerNameSnapshot: 'Acme', customerCodeSnapshot: 'CUS-000001', paymentTerms: '30 days', commercialTerms: 'Standard',
  notes: 'Notes', sentAt: status === 'Draft' ? null : '2026-10-01T11:00:00Z', acceptedAt: status === 'Accepted' ? '2026-10-02T11:00:00Z' : null,
  rejectedAt: status === 'Rejected' ? '2026-10-02T11:00:00Z' : null, rejectionReason: status === 'Rejected' ? 'Budget' : null,
  createdAt: '2026-10-01T10:00:00Z', lines: [{ id: 'line-1', lineNumber: 1, catalogItemId: 'catalog-1', itemCode: 'CAT-000001', itemName: 'Support', description: 'Support', quantity: 2, unit: 'Hour', unitPrice: 50, discountType: 'Percentage', discountValue: 10, discountAmount: 10, taxRate: 20, taxAmount: 18, lineSubtotal: 100, lineTotal: 108 }],
});

describe('Company Quotation pages', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('calculates the client preview in the same order as the server contract', () => {
    const preview = calculateQuotationPreview({ lines: [{ catalogItemId: null, itemName: 'Custom', description: 'Custom', quantity: 3, unit: 'Unit', unitPrice: 19.99, discountType: 'Percentage', discountValue: 10, taxRate: 20 }] });
    expect(preview.subtotal).toBe(59.97);
    expect(preview.discountTotal).toBe(6);
    expect(preview.taxTotal).toBe(10.79);
    expect(preview.grandTotal).toBe(64.76);
  });

  it('renders a server-backed quotation list and sends search and sort changes', async () => {
    mocks.quotationService.customers.mockResolvedValue([{ id: 'customer-1', customerCode: 'CUS-000001', displayName: 'Acme' }]);
    mocks.quotationService.list.mockResolvedValue({ page: 1, pageSize: 20, total: 1, items: [detail()] });
    render(<MemoryRouter><QuotationListPage /></MemoryRouter>);
    expect(await screen.findByText('QTN-000001')).toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('centralAdmin.quotations.search'), 'QTN');
    await waitFor(() => expect(mocks.quotationService.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'QTN' })));
    await user.click(screen.getByRole('button', { name: /centralAdmin\.quotations\.table\.number/ }));
    expect(mocks.quotationService.list).toHaveBeenCalledWith(expect.objectContaining({ sortBy: 'quotationNumber' }));
  });

  it('prefills customer, contact, currency, and catalog lines from an opportunity', async () => {
    mocks.quotationService.customers.mockResolvedValue([{ id: 'customer-1', customerCode: 'CUS-000001', displayName: 'Acme' }]);
    mocks.quotationService.catalog.mockResolvedValue([{ id: 'catalog-1', code: 'CAT-000001', name: 'Support', description: 'Support', type: 'Service', defaultUnit: 'Hour', basePrice: 50, currency: 'EGP', supportsLicense: false, supportsSubscription: false }]);
    mocks.quotationService.currencies.mockResolvedValue([{ code: 'EGP', name: 'Egyptian Pound', symbol: 'E£' }]);
    mocks.quotationService.opportunities.mockResolvedValue([{ id: 'opportunity-1', opportunityCode: 'SAL-000001', title: 'Expansion', customerId: 'customer-1', contactId: 'contact-1', customerDisplayName: 'Acme', status: 'Open', currency: 'EGP', interestedCatalogItemIds: ['catalog-1'] }]);
    mocks.quotationService.contacts.mockResolvedValue([{ id: 'contact-1', name: 'Sam', email: 'sam@example.com', phone: null }]);
    render(<MemoryRouter initialEntries={['/admin/sales/quotations/new?opportunityId=opportunity-1']}><QuotationFormPage /></MemoryRouter>);
    const customer = await screen.findByLabelText(/centralAdmin\.quotations\.form\.customer/);
    await waitFor(() => expect(customer).toHaveValue('customer-1'));
    await waitFor(() => expect(screen.getByLabelText(/centralAdmin\.quotations\.form\.currency/)).toHaveValue('EGP'));
    expect(screen.getByDisplayValue('Support')).toBeInTheDocument();
    expect(await screen.findByText('Sam — sam@example.com')).toBeInTheDocument();
  });

  it('exposes sent lifecycle actions and refreshes to accepted', async () => {
    mocks.quotationService.get.mockResolvedValue(detail('Sent'));
    mocks.quotationService.accept.mockResolvedValue(detail('Accepted'));
    render(<MemoryRouter initialEntries={['/admin/sales/quotations/quotation-1']}><Routes><Route path="/admin/sales/quotations/:quotationId" element={<QuotationDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByRole('button', { name: 'centralAdmin.quotations.actions.accept' })).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'centralAdmin.quotations.actions.accept' }));
    expect(mocks.quotationService.accept).toHaveBeenCalledWith('quotation-1');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'centralAdmin.quotations.actions.accept' })).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'centralAdmin.quotations.actions.accept' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'centralAdmin.quotations.actions.print' })).toHaveAttribute('href', '/admin/sales/quotations/quotation-1/print');
  });
});
