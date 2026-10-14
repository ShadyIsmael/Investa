import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import MainLayout from './MainLayout';

vi.mock('@/components/layout/Sidebar', () => ({
  Sidebar: () => <aside aria-label="sidebar stub" />,
}));

vi.mock('@/components/common/Notifications', () => ({
  default: () => null,
}));

vi.mock('@/features/support/ChatRequestListener', () => ({
  default: () => null,
}));

vi.mock('@/features/support/ChatConversationsListener', () => ({
  default: () => null,
}));

vi.mock('@/services/backendHealth', () => ({
  default: () => null,
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

vi.mock('@/components/common/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav aria-label="breadcrumbs stub" />,
}));

vi.mock('@/components/layout/WorkspaceContext', () => ({
  WorkspaceContext: () => <div data-testid="workspace-context-stub" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const currentUser = {
  id: 'user-1',
  firstName: 'Admin',
  lastName: 'User',
  name: 'Admin User',
  email: 'admin@example.test',
  role: 'Administrator',
  roleId: null,
  groupName: null,
  groupId: null,
  roleName: 'Administrator',
  status: 'Active' as const,
  lastLogin: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: null,
  avatar: null,
  metadata: {},
};

describe('shared workspace layout regression', () => {
  it('keeps business content available without a degraded dependency hero or reserved block', () => {
    render(
      <MemoryRouter initialEntries={['/admin/fopx/overview']}>
        <MainLayout currentUser={currentUser} handleLogout={vi.fn()}>
          <div>business content</div>
        </MainLayout>
      </MemoryRouter>,
    );

    const main = screen.getByRole('main');
    const content = main.querySelector('.workspace-content');

    expect(screen.getByText('business content')).toBeInTheDocument();
    expect(screen.queryByText('centralAdmin.states.backendDegradedTitle')).not.toBeInTheDocument();
    expect(main.querySelector('.enterprise-state')).not.toBeInTheDocument();
    expect(content).not.toBeNull();
    expect(content).toHaveClass('workspace-content');
    expect(content?.className).not.toMatch(/max-w-|min-h-|enterprise-state/);
  });

  it('keeps the compact header health indicator when the API is degraded', () => {
    render(
      <MemoryRouter initialEntries={['/admin/fopx/overview']}>
        <MainLayout currentUser={currentUser} handleLogout={vi.fn()}>
          <div>business content</div>
        </MainLayout>
      </MemoryRouter>,
    );

    expect(screen.getByText('centralAdmin.health.healthy')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent('investa:backend:degraded'));
    });

    expect(screen.getByText('centralAdmin.health.degraded')).toBeInTheDocument();
    expect(screen.getByText('business content')).toBeInTheDocument();
  });
});
