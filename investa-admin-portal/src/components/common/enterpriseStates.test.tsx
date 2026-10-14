import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { RouteGuard } from './RouteGuard';
import { BackendUnavailable, NotFound, RouteLoadingBoundary } from './EnterpriseStates';

vi.mock('@/context/AuthContext', () => ({
  usePermissions: () => ({
    isAuthenticated: true,
    permissions: ['User.View'],
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('enterprise shell state regression', () => {
  it('renders a protected-route 403 state without redirecting or logging out', () => {
    render(
      <MemoryRouter initialEntries={['/admin/system']}>
        <RouteGuard policy={{ requiredPermissions: ['Global.System.Configure'] }}>
          <div>protected content</div>
        </RouteGuard>
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('centralAdmin.states.accessTitle');
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });

  it('keeps 404 and backend-unavailable states explicit and accessible', () => {
    render(
      <MemoryRouter>
        <NotFound />
        <BackendUnavailable />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    const backendState = screen.getByRole('alert');
    expect(backendState).toHaveClass('enterprise-state-compact');
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  it('provides a shared non-blank route loading state', () => {
    render(<RouteLoadingBoundary />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('centralAdmin.states.loadingTitle');
  });
});
