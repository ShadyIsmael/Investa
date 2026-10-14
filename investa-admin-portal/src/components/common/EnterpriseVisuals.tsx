import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common/Icons';

/**
 * EnterpriseVisuals — shared TASK 05 primitives.
 * Single source for semantic status color, badges, sections, table actions,
 * empty/loading/error states, alerts and confirm dialogs.
 * Presentation only: no business logic, no API, no routing changes.
 */

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

const NORMALIZED = (value: string): string => value.trim().toLowerCase();

/** Consistent business-meaning → tone mapping across ALL modules (§6). */
export const getStatusTone = (status: string): StatusTone => {
  switch (NORMALIZED(status)) {
    case 'active':
    case 'accepted':
    case 'won':
    case 'completed':
    case 'approved':
    case 'funded':
    case 'fullyfunded':
    case 'fully_funded':
    case 'published':
    case 'resolved':
      return 'success';
    case 'pending':
    case 'suspended':
    case 'expiring':
    case 'degraded':
    case 'under_review':
    case 'under review':
    case 'underreview':
    case 'in_review':
    case 'changesrequested':
    case 'changes_requested':
    case 'paused':
      return 'warning';
    case 'rejected':
    case 'lost':
    case 'terminated':
    case 'expired':
    case 'failed':
    case 'unavailable':
      return 'danger';
    case 'open':
    case 'sent':
    case 'in_progress':
    case 'in progress':
    case 'inprogress':
    case 'funding':
    case 'review':
    case 'submitted':
    case 'scheduled':
      return 'info';
    case 'draft':
    case 'new':
    case 'inactive':
    case 'closed':
    case 'cancelled':
    case 'canceled':
    case 'archived':
    case 'notscheduled':
    case 'not_scheduled':
      return 'neutral';
    default:
      return 'neutral';
  }
};

/** Lifecycle action → restrained semantic button class (§9–10). */
export const getLifecycleButtonClass = (action: string): string => {
  switch (NORMALIZED(action)) {
    case 'activate':
    case 'accept':
    case 'approve':
    case 'mark won':
    case 'won':
    case 'complete':
      return 'btn-primary';
    case 'send':
    case 'create':
    case 'save':
      return 'btn-primary';
    case 'deactivate':
    case 'suspend':
      return 'btn-secondary';
    case 'reject':
    case 'mark lost':
    case 'lost':
    case 'terminate':
    case 'delete':
      return 'btn-danger';
    default:
      return 'btn-secondary';
  }
};

export const StatusBadge: React.FC<{ status: string; label?: string; tone?: StatusTone; className?: string }> = ({
  status,
  label,
  tone,
  className = '',
}) => {
  const resolved = tone ?? getStatusTone(status);
  const text = label ?? status;
  return (
    <span className={`status-badge status-badge-${resolved} ${className}`.trim()} data-testid="status-badge" data-tone={resolved}>
      <span className="status-badge-dot" aria-hidden="true" />
      {text}
    </span>
  );
};

export const SemanticBadge: React.FC<{ tone?: StatusTone; icon?: string; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  icon,
  children,
  className = '',
}) => (
  <span className={`status-badge status-badge-${tone} ${className}`.trim()} data-testid="semantic-badge" data-tone={tone}>
    {icon ? <Icon name={icon} className="status-badge-icon" /> : <span className="status-badge-dot" aria-hidden="true" />}
    {children}
  </span>
);

export const CapabilityBadge: React.FC<{ icon?: string; children: React.ReactNode }> = ({ icon, children }) => (
  <span className="capability-flag" data-testid="capability-flag">
    {icon && <Icon name={icon} className="capability-flag-icon" />}
    {children}
  </span>
);

export const SectionHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode }> = ({
  title,
  description,
  actions,
}) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h2 className="section-title detail-section-title">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const DetailSection: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  children,
  action,
}) => (
  <section className="enterprise-panel" aria-label={title}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="detail-section-title">{title}</h2>
      {action}
    </div>
    <div className="mt-1">{children}</div>
  </section>
);

export const DetailField: React.FC<{ label: string; children: React.ReactNode; dir?: 'ltr' | 'rtl'; strong?: boolean }> = ({
  label,
  children,
  dir,
  strong,
}) => (
  <div>
    <dt className="detail-label">{label}</dt>
    <dd className={strong ? 'detail-value-strong' : 'detail-value'} dir={dir}>
      {children}
    </dd>
  </div>
);

export const Money: React.FC<{ value: string; secondary?: boolean }> = ({ value, secondary }) => (
  <span className={secondary ? 'money-secondary' : 'money'} dir="ltr">
    {value}
  </span>
);

export const GrandTotal: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="totals-block-grand">
    <dt className="text-sm font-semibold text-foreground">{label}</dt>
    <dd className="grand-total" dir="ltr">
      {value}
    </dd>
  </div>
);

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  description?: string;
  primaryAction?: { label: string; to?: string; onClick?: () => void; icon?: string };
  secondaryAction?: { label: string; onClick: () => void; icon?: string };
}> = ({ icon = 'search', title, description, primaryAction, secondaryAction }) => (
  <div className="empty-state" role="status">
    <div className="enterprise-state-icon mx-auto">
      <Icon name={icon} className="h-6 w-6" />
    </div>
    <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
    {description && <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{description}</p>}
    {(primaryAction || secondaryAction) && (
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {primaryAction?.to ? (
          <Link className="btn-primary" to={primaryAction.to}>
            {primaryAction.icon && <Icon name={primaryAction.icon} className="btn-icon" />}
            {primaryAction.label}
          </Link>
        ) : (
          primaryAction && (
            <button type="button" className="btn-primary" onClick={primaryAction.onClick}>
              {primaryAction.icon && <Icon name={primaryAction.icon} className="btn-icon" />}
              {primaryAction.label}
            </button>
          )
        )}
        {secondaryAction && (
          <button type="button" className="btn-secondary" onClick={secondaryAction.onClick}>
            {secondaryAction.icon && <Icon name={secondaryAction.icon} className="btn-icon" />}
            {secondaryAction.label}
          </button>
        )}
      </div>
    )}
  </div>
);

export const TableSkeleton: React.FC<{ label: string; rows?: number }> = ({ label, rows = 5 }) => (
  <div className="space-y-3 p-5" aria-label={label} aria-busy="true">
    {Array.from({ length: rows }).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <div key={index} className="table-skeleton-row animate-pulse" />
    ))}
  </div>
);

export const InlineAlert: React.FC<{ tone?: 'warning' | 'danger' | 'success' | 'info'; children: React.ReactNode }> = ({
  tone = 'info',
  children,
}) => (
  <div role="alert" className={`callout callout-${tone}`}>
    {children}
  </div>
);

export const ConfirmDialog: React.FC<{
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
  confirming?: boolean;
}> = ({ title, description, confirmLabel, cancelLabel, onConfirm, onCancel, danger, confirming }) => (
  <div className="dialog-overlay" role="presentation" onMouseDown={event => event.target === event.currentTarget && onCancel()}>
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" className="dialog-panel">
      <h2 id="confirm-dialog-title" className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      <div className="form-footer">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={confirming}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={danger ? 'btn-danger dialog-danger-confirm' : 'btn-primary'}
          onClick={onConfirm}
          disabled={confirming}
          data-testid={danger ? 'confirm-destructive' : 'confirm-primary'}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/** Consistent row action: visible primary Open (icon+text) + overflow for secondary actions. */
export const TableRowActions: React.FC<{
  openTo: string;
  openLabel: string;
  overflowLabel: string;
  children: React.ReactNode;
}> = ({ openTo, openLabel, overflowLabel, children }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);
  return (
    <div className="table-actions">
      <Link className="btn-secondary btn-sm" to={openTo}>
        {openLabel}
        <span aria-hidden="true">›</span>
      </Link>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="btn-ghost btn-sm"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={overflowLabel}
          title={overflowLabel}
          onClick={() => setOpen(value => !value)}
        >
          <Icon name="ellipsis" className="h-4 w-4" />
        </button>
        {open && (
          <div role="menu" className="absolute end-0 z-40 mt-1 min-w-40 rounded-md border border-border bg-background p-1 shadow-md">
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const OverflowMenuItem: React.FC<{ to?: string; onClick?: () => void; icon?: string; danger?: boolean; children: React.ReactNode }> = ({
  to,
  onClick,
  icon,
  danger,
  children,
}) => {
  const className = `flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm font-medium hover:bg-muted ${danger ? 'text-rose-700 dark:text-rose-300' : 'text-foreground'}`;
  const content = (
    <>
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </>
  );
  if (to) {
    return (
      <Link to={to} role="menuitem" className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" role="menuitem" className={className} onClick={onClick}>
      {content}
    </button>
  );
};

/** Icon + label action button that keeps accessible text (never icon-only for business actions). */
export const ActionButton: React.FC<{
  icon: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}> = ({ icon, children, variant = 'secondary', to, onClick, disabled, type = 'button' }) => {
  const className = `btn-${variant}`;
  const content = (
    <>
      <Icon name={icon} className="btn-icon" />
      {children}
    </>
  );
  if (to) {
    return (
      <Link className={className} to={to} aria-disabled={disabled || undefined} onClick={disabled ? event => event.preventDefault() : undefined}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={className} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
};
