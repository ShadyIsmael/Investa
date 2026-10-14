import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { CustomerDetailPage } from './CustomerDetailPage';
import { CustomerFormPage } from './CustomerFormPage';
import { CustomerListPage } from './CustomerListPage';
import { CANONICAL_ROUTE_REGISTRY } from '@/core/routeRegistry';

const mocks = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), setStatus: vi.fn(), addContact: vi.fn(), updateContact: vi.fn(), setContactStatus: vi.fn(), setPrimaryContact: vi.fn() }));
vi.mock('./customerService', async () => {
  const actual = await vi.importActual<typeof import('./customerService')>('./customerService');
  return { ...actual, customerService: mocks };
});
vi.mock('@/context/AuthContext', () => ({ usePermissions: () => ({ permissions: ['Company.Customers.View', 'Company.Customers.Create', 'Company.Customers.Edit', 'Company.Customers.Manage'], isAuthenticated: true, hasPermission: (value: string) => value.startsWith('Company.Customers'), hasAnyPermission: (...values: string[]) => values.some(value => value.startsWith('Company.Customers')), hasAllPermissions: (...values: string[]) => values.every(value => value.startsWith('Company.Customers')) }) }));
vi.mock('react-i18next', async () => ({ ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')), useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key, i18n: { language: 'en' } }) }));

const customer = (overrides: Record<string, unknown> = {}) => ({ id: 'customer-1', customerCode: 'CUS-000001', type: 'Organization' as const, displayName: 'Acme', legalName: 'Acme LLC', primaryEmail: 'hello@example.com', primaryPhone: '+201000000000', primaryContactName: 'Nadia', city: 'Cairo', country: 'Egypt', status: 'Active' as const, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z', ...overrides });
const detail = () => ({ ...customer(), taxId: null, commercialRegistrationNumber: 'CR-1', website: null, address: 'Main Street', notes: null, contacts: [{ id: 'contact-1', name: 'Nadia', jobTitle: 'Director', email: 'nadia@example.com', phone: '+201000000001', isPrimary: true, isActive: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }] });

describe('Company Customer pages', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('renders empty and filtered list states from the typed list contract', async () => {
    mocks.list.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    render(<MemoryRouter><CustomerListPage /></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.customers.emptyTitle')).toBeInTheDocument();
    expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }));
  });

  it('renders a customer row and server pagination controls', async () => {
    mocks.list.mockResolvedValue({ items: [customer()], total: 21, page: 1, pageSize: 20 });
    render(<MemoryRouter><CustomerListPage /></MemoryRouter>);
    expect(await screen.findByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('keeps required form fields client-validated before create', async () => {
    render(<MemoryRouter><CustomerFormPage /></MemoryRouter>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'centralAdmin.customers.actions.save' }));
    expect(await screen.findByText('centralAdmin.customers.validation.names')).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('renders controlled detail 404 and contacts', async () => {
    mocks.get.mockRejectedValueOnce(new ApiError(404, 'missing'));
    render(<MemoryRouter initialEntries={['/admin/customers/missing']}><Routes><Route path="/admin/customers/:customerId" element={<CustomerDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.customers.errors.notFoundTitle')).toBeInTheDocument();

    mocks.get.mockResolvedValueOnce(detail());
    render(<MemoryRouter initialEntries={['/admin/customers/customer-1']}><Routes><Route path="/admin/customers/:customerId" element={<CustomerDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Nadia')).toBeInTheDocument();
    expect(screen.getByText('centralAdmin.customers.primary')).toBeInTheDocument();
  });

  it('registers canonical customer routes with lazy-ready component boundaries', () => {
    expect(CANONICAL_ROUTE_REGISTRY.find(route => route.path === '/admin/customers')?.component).toBe('CustomerListPage');
    expect(CANONICAL_ROUTE_REGISTRY.find(route => route.path === '/admin/customers/new')?.requiredPermissions).toContain('Company.Customers.Create');
    expect(CANONICAL_ROUTE_REGISTRY.find(route => route.path === '/admin/customers/:customerId/edit')?.requiredPermissions).toContain('Company.Customers.Edit');
  });
});
