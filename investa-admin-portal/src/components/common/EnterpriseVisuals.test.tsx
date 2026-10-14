import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  ActionButton,
  ConfirmDialog,
  EmptyState,
  StatusBadge,
  TableRowActions,
  getLifecycleButtonClass,
  getStatusTone,
} from './EnterpriseVisuals';

describe('enterprise visuals shared kit', () => {
  it('maps lifecycle statuses to consistent semantic tones', () => {
    expect(getStatusTone('Active')).toBe('success');
    expect(getStatusTone('Accepted')).toBe('success');
    expect(getStatusTone('Won')).toBe('success');
    expect(getStatusTone('Completed')).toBe('success');
    expect(getStatusTone('Draft')).toBe('neutral');
    expect(getStatusTone('Inactive')).toBe('neutral');
    expect(getStatusTone('Open')).toBe('info');
    expect(getStatusTone('Sent')).toBe('info');
    expect(getStatusTone('Pending')).toBe('warning');
    expect(getStatusTone('Suspended')).toBe('warning');
    expect(getStatusTone('Rejected')).toBe('danger');
    expect(getStatusTone('Lost')).toBe('danger');
    expect(getStatusTone('Terminated')).toBe('danger');
    expect(getStatusTone('Expired')).toBe('danger');
  });

  it('renders status text with a non-color signal and tone', () => {
    render(<StatusBadge status="Accepted" label="Accepted" />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Accepted');
    expect(badge).toHaveAttribute('data-tone', 'success');
  });

  it('keeps lifecycle action emphasis restrained and semantic', () => {
    expect(getLifecycleButtonClass('activate')).toBe('btn-primary');
    expect(getLifecycleButtonClass('accept')).toBe('btn-primary');
    expect(getLifecycleButtonClass('send')).toBe('btn-primary');
    expect(getLifecycleButtonClass('deactivate')).toBe('btn-secondary');
    expect(getLifecycleButtonClass('reject')).toBe('btn-danger');
    expect(getLifecycleButtonClass('terminate')).toBe('btn-danger');
  });

  it('distinguishes destructive confirm from cancel', () => {
    render(
      <ConfirmDialog
        title="Terminate contract"
        confirmLabel="Confirm terminate"
        cancelLabel="Cancel"
        onConfirm={() => {}}
        onCancel={() => {}}
        danger
      />,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('btn-secondary');
    expect(screen.getByTestId('confirm-destructive')).toHaveClass('btn-danger');
  });

  it('renders table row primary open action with accessible overflow', async () => {
    render(
      <MemoryRouter>
        <table>
          <tbody>
            <tr>
              <td>
                <TableRowActions openTo="/admin/customers/1" openLabel="Open" overflowLabel="More actions">
                  <span>extra</span>
                </TableRowActions>
              </td>
            </tr>
          </tbody>
        </table>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /open/i })).toHaveAttribute('href', '/admin/customers/1');
    await userEvent.setup().click(screen.getByRole('button', { name: 'More actions' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('keeps business actions as icon plus text', () => {
    render(
      <MemoryRouter>
        <ActionButton icon="plus" variant="primary" to="/admin/customers/new">
          New Customer
        </ActionButton>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'New Customer' });
    expect(link).toHaveClass('btn-primary');
    expect(link.textContent).toContain('New Customer');
  });

  it('renders empty states with recovery actions', () => {
    render(
      <MemoryRouter>
        <EmptyState
          title="No customers yet"
          description="Create your first customer."
          primaryAction={{ label: 'New Customer', to: '/admin/customers/new', icon: 'plus' }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New Customer' })).toBeInTheDocument();
  });
});
