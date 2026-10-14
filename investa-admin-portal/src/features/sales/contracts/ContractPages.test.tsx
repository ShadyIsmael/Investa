import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContractDetailPage } from './ContractDetailPage';
import { ContractFormPage } from './ContractFormPage';
import { ContractListPage } from './ContractListPage';
import type { ContractDetail } from './contractService';
import type { QuotationDetail } from '../quotations/quotationService';
import { QuotationDetailPage } from '../quotations/QuotationDetailPage';

const mocks = vi.hoisted(() => ({
  contractService: { list: vi.fn(), get: vi.fn(), getByQuotation: vi.fn(), createFromQuotation: vi.fn(), update: vi.fn(), activate: vi.fn(), complete: vi.fn(), terminate: vi.fn(), customers: vi.fn(), currencies: vi.fn() },
  quotationService: { get: vi.fn(), customers: vi.fn(), currencies: vi.fn() },
}));

vi.mock('./contractService', async () => { const actual = await vi.importActual<typeof import('./contractService')>('./contractService'); return { ...actual, contractService: mocks.contractService }; });
vi.mock('../quotations/quotationService', async () => { const actual = await vi.importActual<typeof import('../quotations/quotationService')>('../quotations/quotationService'); return { ...actual, quotationService: mocks.quotationService }; });
vi.mock('@/context/AuthContext', () => ({ usePermissions: () => ({ permissions: ['Company.Sales.Contracts.View', 'Company.Sales.Contracts.Create', 'Company.Sales.Contracts.Edit', 'Company.Sales.Contracts.Manage'], isAuthenticated: true, hasPermission: (value: string) => value.startsWith('Company.Sales.Contracts'), hasAnyPermission: (...values: string[]) => values.some(value => value.startsWith('Company.Sales.Contracts') || value.startsWith('SalesContract.')), hasAllPermissions: (...values: string[]) => values.every(value => value.startsWith('Company.Sales.Contracts')) }) }));
vi.mock('react-i18next', async () => ({ ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')), useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key, i18n: { language: 'en' } }) }));

const line = { id: 'line-1', sourceQuotationLineId: 'quotation-line-1', lineNumber: 1, catalogItemId: 'catalog-1', itemCode: 'CAT-000001', itemName: 'Support', description: 'Support', quantity: 2, unit: 'Hour', unitPrice: 50, discountType: 'None' as const, discountValue: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, lineSubtotal: 100, lineTotal: 100, supportsLicense: true, supportsSubscription: false };
const contract = (status: ContractDetail['status'] = 'Draft'): ContractDetail => ({ id: 'contract-1', contractNumber: 'CTR-000001', customerId: 'customer-1', customerCode: 'CUS-000001', customerName: 'Acme', sourceQuotationId: 'quotation-1', sourceQuotationNumber: 'QTN-000001', salesOpportunityId: 'opportunity-1', salesOpportunityCode: 'SAL-000001', salesOpportunityTitle: 'Expansion', status, currency: 'USD', effectiveDate: '2026-10-01', startDate: '2026-10-01', endDate: '2027-09-30', grandTotal: 100, updatedAt: '2026-10-01T10:00:00Z', contactId: 'contact-1', contactName: 'Sam', contactEmail: 'sam@example.com', contactPhone: null, customerCodeSnapshot: 'CUS-000001', customerNameSnapshot: 'Acme', customerLegalNameSnapshot: 'Acme LLC', signedDate: null, subtotal: 100, discountTotal: 0, taxTotal: 0, paymentTerms: 'Net 30', commercialTerms: 'Standard', notes: 'Notes', activatedAt: status === 'Active' || status === 'Completed' || status === 'Terminated' ? '2026-10-01T11:00:00Z' : null, completedAt: status === 'Completed' ? '2026-10-02T11:00:00Z' : null, terminatedAt: status === 'Terminated' ? '2026-10-02T11:00:00Z' : null, terminationReason: status === 'Terminated' ? 'Cancelled' : null, createdAt: '2026-10-01T10:00:00Z', lines: [line] });
const quotation = (contractId: string | null = null): QuotationDetail => ({ id: 'quotation-1', quotationNumber: 'QTN-000001', customerId: 'customer-1', customerCode: 'CUS-000001', customerName: 'Acme', salesOpportunityId: null, salesOpportunityCode: null, salesOpportunityTitle: null, status: 'Accepted', issueDate: '2026-10-01', validUntil: null, isExpired: false, currency: 'USD', subtotal: 100, discountTotal: 0, taxTotal: 0, grandTotal: 100, updatedAt: '2026-10-01T10:00:00Z', contractId, contactId: null, contactName: null, contactEmail: null, contactPhone: null, customerNameSnapshot: 'Acme', customerCodeSnapshot: 'CUS-000001', paymentTerms: 'Net 30', commercialTerms: 'Standard', notes: null, sentAt: '2026-10-01T11:00:00Z', acceptedAt: '2026-10-01T12:00:00Z', rejectedAt: null, rejectionReason: null, createdAt: '2026-10-01T10:00:00Z', lines: [{ id: 'quotation-line-1', lineNumber: 1, catalogItemId: 'catalog-1', itemCode: 'CAT-000001', itemName: 'Support', description: 'Support', quantity: 2, unit: 'Hour', unitPrice: 50, discountType: 'None', discountValue: 0, discountAmount: 0, taxRate: 0, taxAmount: 0, lineSubtotal: 100, lineTotal: 100 }] });

describe('Company Contract pages', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('renders a server-backed list and sends search and status filters', async () => {
    mocks.contractService.customers.mockResolvedValue([{ id: 'customer-1', customerCode: 'CUS-000001', displayName: 'Acme' }]);
    mocks.contractService.list.mockResolvedValue({ page: 1, pageSize: 20, total: 1, items: [contract()] });
    render(<MemoryRouter><ContractListPage /></MemoryRouter>);
    expect(await screen.findByText('CTR-000001')).toBeInTheDocument();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('centralAdmin.contracts.search'), 'CTR');
    await waitFor(() => expect(mocks.contractService.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'CTR' })));
    await user.selectOptions(screen.getByLabelText('centralAdmin.contracts.status'), 'Draft');
    await waitFor(() => expect(mocks.contractService.list).toHaveBeenCalledWith(expect.objectContaining({ status: 'Draft' })));
  });

  it('creates from an accepted quotation while keeping source lines read-only', async () => {
    mocks.quotationService.get.mockResolvedValue(quotation());
    mocks.contractService.createFromQuotation.mockResolvedValue(contract());
    render(<MemoryRouter initialEntries={['/admin/sales/contracts/from-quotation/quotation-1']}><Routes><Route path="/admin/sales/contracts/from-quotation/:quotationId" element={<ContractFormPage />} /><Route path="/admin/sales/contracts/:contractId" element={<div />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('QTN-000001')).toBeInTheDocument();
    expect(screen.getAllByText('Support').length).toBeGreaterThan(0);
    expect(screen.queryByRole('textbox', { name: /centralAdmin\.contracts\.description/ })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'centralAdmin.contracts.actions.saveDraft' }));
    await waitFor(() => expect(mocks.contractService.createFromQuotation).toHaveBeenCalledWith('quotation-1', expect.objectContaining({ paymentTerms: '' })));
  });

  it('shows lifecycle action for a draft and refreshes after activation', async () => {
    mocks.contractService.get.mockResolvedValueOnce(contract('Draft')).mockResolvedValueOnce(contract('Active'));
    mocks.contractService.activate.mockResolvedValue(contract('Active'));
    render(<MemoryRouter initialEntries={['/admin/sales/contracts/contract-1']}><Routes><Route path="/admin/sales/contracts/:contractId" element={<ContractDetailPage />} /></Routes></MemoryRouter>);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'centralAdmin.contracts.actions.activate' }));
    expect(mocks.contractService.activate).toHaveBeenCalledWith('contract-1');
    await waitFor(() => expect(screen.getAllByText('centralAdmin.contracts.statuses.Active').length).toBeGreaterThan(0));
  });

  it('links an accepted quotation to create or view its Company Contract', async () => {
    mocks.quotationService.get.mockResolvedValueOnce(quotation()).mockResolvedValueOnce(quotation('contract-1'));
    const { unmount } = render(<MemoryRouter initialEntries={['/admin/sales/quotations/quotation-1']}><Routes><Route path="/admin/sales/quotations/:quotationId" element={<QuotationDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByRole('link', { name: 'centralAdmin.quotations.actions.createContract' })).toHaveAttribute('href', '/admin/sales/contracts/from-quotation/quotation-1');
    unmount();
    render(<MemoryRouter initialEntries={['/admin/sales/quotations/quotation-1']}><Routes><Route path="/admin/sales/quotations/:quotationId" element={<QuotationDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByRole('link', { name: 'centralAdmin.quotations.actions.viewContract' })).toHaveAttribute('href', '/admin/sales/contracts/contract-1');
  });
});
