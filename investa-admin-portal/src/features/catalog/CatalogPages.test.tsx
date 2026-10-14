import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { getCanonicalRoute } from '@/core/routeRegistry';
import { CatalogDetailPage } from './CatalogDetailPage';
import { CatalogFormPage } from './CatalogFormPage';
import { CatalogListPage } from './CatalogListPage';

const mocks = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), setStatus: vi.fn() }));
vi.mock('./catalogService', async () => {
  const actual = await vi.importActual<typeof import('./catalogService')>('./catalogService');
  return { ...actual, catalogService: mocks };
});
vi.mock('@/context/AuthContext', () => ({ usePermissions: () => ({ permissions: ['Company.Products.View', 'Company.Products.Create', 'Company.Products.Edit', 'Company.Products.Manage'], isAuthenticated: true, hasPermission: (value: string) => value.startsWith('Company.Products'), hasAnyPermission: (...values: string[]) => values.some(value => value.startsWith('Company.Products')), hasAllPermissions: (...values: string[]) => values.every(value => value.startsWith('Company.Products')) }) }));
vi.mock('react-i18next', async () => ({ ...(await vi.importActual<typeof import('react-i18next')>('react-i18next')), useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue || key, i18n: { language: 'en' } }) }));

const item = (overrides: Record<string, unknown> = {}) => ({ id: 'item-1', code: 'CAT-000001', name: 'FOPX Enterprise', type: 'Product' as const, defaultUnit: 'Seat' as const, basePrice: 100, currency: 'EGP', supportsLicense: true, supportsSubscription: true, supportsWorkspace: true, status: 'Active' as const, updatedAt: '2026-01-02T00:00:00Z', ...overrides });
const detail = () => ({ ...item(), description: 'Commercial product', workspaceKey: 'fopx', createdAt: '2026-01-01T00:00:00Z' });

describe('Company Catalog pages', () => {
  beforeEach(() => { vi.resetAllMocks(); });

  it('renders empty and server-paged list states', async () => {
    mocks.list.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    render(<MemoryRouter><CatalogListPage /></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.catalog.emptyTitle')).toBeInTheDocument();
    expect(mocks.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 20 }));

    mocks.list.mockResolvedValueOnce({ items: [item()], total: 21, page: 1, pageSize: 20 });
    render(<MemoryRouter><CatalogListPage /></MemoryRouter>);
    expect(await screen.findByText('FOPX Enterprise')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('shows conditional workspace and price/currency fields', async () => {
    render(<MemoryRouter><CatalogFormPage /></MemoryRouter>);
    expect(screen.queryByText('centralAdmin.catalog.form.workspaceKey')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByText('centralAdmin.catalog.capabilities.workspace'));
    expect(screen.getByText('centralAdmin.catalog.form.workspaceKey')).toBeInTheDocument();
    const price = screen.getByLabelText('centralAdmin.catalog.form.basePrice');
    await userEvent.setup().type(price, '100');
    expect(screen.getByLabelText('centralAdmin.catalog.form.currency')).toBeEnabled();
  });

  it('keeps required form validation client-side', async () => {
    render(<MemoryRouter><CatalogFormPage /></MemoryRouter>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'centralAdmin.catalog.actions.save' }));
    expect(await screen.findByText('centralAdmin.catalog.validation.name')).toBeInTheDocument();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('renders controlled 404 and catalog detail capabilities', async () => {
    mocks.get.mockRejectedValueOnce(new ApiError(404, 'missing'));
    render(<MemoryRouter initialEntries={['/admin/catalog/products/missing']}><Routes><Route path="/admin/catalog/products/:itemId" element={<CatalogDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('centralAdmin.catalog.errors.notFoundTitle')).toBeInTheDocument();

    mocks.get.mockResolvedValueOnce(detail());
    render(<MemoryRouter initialEntries={['/admin/catalog/products/item-1']}><Routes><Route path="/admin/catalog/products/:itemId" element={<CatalogDetailPage />} /></Routes></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'FOPX Enterprise' })).toBeInTheDocument();
    expect(screen.getByText('centralAdmin.catalog.capabilities.license')).toBeInTheDocument();
  });

  it('registers canonical catalog routes with lazy-ready component boundaries', () => {
    expect(getCanonicalRoute('/admin/catalog/products')?.component).toBe('CatalogListPage');
    expect(getCanonicalRoute('/admin/catalog/products')?.availability).toBeUndefined();
    expect(getCanonicalRoute('/admin/catalog/products/new')?.requiredPermissions).toContain('Company.Products.Create');
    expect(getCanonicalRoute('/admin/catalog/products/:itemId/edit')?.requiredPermissions).toContain('Company.Products.Edit');
  });
});
