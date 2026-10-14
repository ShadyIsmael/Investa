import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RouteGuard } from '@/components/common/RouteGuard';
import { LazyRouteBoundary } from '@/components/common/LazyRouteBoundary';
import { lazyNamedRoute } from './lazyRoute';
import { Dashboard, GlobalOverview, OpportunityDetailPage, OpportunityListPage, UsersList } from './routeLoaders';

vi.mock('@/context/AuthContext', () => ({
  usePermissions: () => ({
    isAuthenticated: true,
    permissions: [],
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Company Management lazy route loading', () => {
  it('keeps Company Core and FOPX route components as lazy boundaries', () => {
    const lazyType = Symbol.for('react.lazy');

    expect((GlobalOverview as { $$typeof: symbol }).$$typeof).toBe(lazyType);
    expect((UsersList as { $$typeof: symbol }).$$typeof).toBe(lazyType);
    expect((Dashboard as { $$typeof: symbol }).$$typeof).toBe(lazyType);
    expect((OpportunityListPage as { $$typeof: symbol }).$$typeof).toBe(lazyType);
    expect((OpportunityDetailPage as { $$typeof: symbol }).$$typeof).toBe(lazyType);
  });

  it('renders a lazy route inside a shared loading boundary', async () => {
    const LazyGlobalRoute = lazyNamedRoute(
      async () => ({ GlobalRoute: () => <div>Global route loaded</div> }),
      'GlobalRoute',
    );

    render(
      <Suspense fallback={<div role="status">route loading</div>}>
        <LazyGlobalRoute />
      </Suspense>,
    );

    expect(await screen.findByText('Global route loaded')).toBeInTheDocument();
  });

  it('does not invoke a protected lazy module when the route is denied', () => {
    const loader = vi.fn(async () => ({ ProtectedRoute: () => <div>protected lazy route</div> }));
    const LazyProtectedRoute = lazyNamedRoute(loader, 'ProtectedRoute');

    render(
      <MemoryRouter>
        <RouteGuard policy={{ requiredPermissions: ['Global.System.Configure'] }}>
          <LazyProtectedRoute />
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('protected lazy route')).not.toBeInTheDocument();
    expect(loader).not.toHaveBeenCalled();
  });

  it('contains a failed dynamic import inside the enterprise error state', async () => {
    const LazyBrokenRoute = lazyNamedRoute(
      async () => {
        throw new Error('internal chunk stack should not be shown');
      },
      'BrokenRoute',
    );

    render(
      <LazyRouteBoundary>
        <Suspense fallback={<div role="status">route loading</div>}>
          <LazyBrokenRoute />
        </Suspense>
      </LazyRouteBoundary>,
    );

    const errorState = await screen.findByRole('alert');
    expect(errorState).toHaveTextContent('centralAdmin.states.moduleErrorTitle');
    expect(errorState).not.toHaveTextContent('internal chunk stack should not be shown');
    expect(screen.getByRole('button')).toHaveTextContent('centralAdmin.states.retry');
  });
});
