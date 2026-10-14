# UX REFINEMENT — TASK 01 GLOBAL WORKSPACE REPORT

## A. Previous health hero source

The shared state layer exposed `BackendDegraded` in `investa-admin-portal/src/components/common/EnterpriseStates.tsx`. It used the shared `.enterprise-state-compact` presentation, whose `min-height: 16rem` reserved a large vertical region, and it was backed by the duplicated EN/AR “Dependency degraded” copy.

The current working tree’s `MainLayout` no longer had a live degraded render branch after the earlier shell consolidation, but the unused shared component and translations remained the source path for reintroducing the global hero. They are removed by this refinement.

## B. Shared layout/components changed

- `MainLayout` now uses the shared `workspace-content` wrapper.
- `index.css` defines responsive workspace padding tokens and the shared wrapper rules.
- `BackendDegraded` and its unused EN/AR global dependency copy were removed.
- `BackendUnavailable`, `BackendHealthMonitor`, `useSystemHealth`, `Header`, navigation, routes, permissions, and business pages were preserved.
- Added shared-shell and health-monitor regression coverage.

## C. Health hero removal

The global degraded hero is removed completely. No global degraded icon, title, explanatory paragraph, banner, empty placeholder, or reserved degraded min-height remains in the shared shell.

## D. Compact top-bar health preserved

`Header` still reads `useSystemHealth()` and renders the compact status dot and localized `Healthy`, `Degraded`, or `Unavailable` state. The header health markup was not removed or redesigned.

## E. Degraded-state behavior

When `/api/health` is reachable with `Degraded` status, `BackendHealthMonitor` still emits `investa:backend:degraded`. The normal page content remains rendered, the header changes to `Degraded`, and the shared shell adds no page-level warning or vertical block.

## F. Core API unavailable behavior

Core API failure detection remains unchanged: failed health responses and fetch errors are interpreted as `unavailable`, `investa:backend:unreachable` remains emitted, and the monitor continues its existing polling/recovery path. The shared `BackendUnavailable` accessible state remains intact and its regression test still passes.

## G. Content vertical spacing

The removed global state region is not replaced. Shared content begins directly below the header with only normal workspace padding. No empty health wrapper or obsolete reserved region remains.

## H. Content horizontal padding

Workspace padding is tokenized through logical `padding-inline` and `padding-block` properties:

- Small fallback: 12px inline / 12px block.
- 640px and up: 16px / 16px.
- 1024px and up: 20px / 20px.
- 1440px and up: 24px / 20px.

No direction-specific padding hacks were added.

## I. Width/max-width behavior

The shared shell wrapper is full width and does not introduce a centered max-width. Existing page-level constraints for forms, details, and focused platform screens remain unchanged. Existing operational table overflow strategies were not changed.

## J. Dashboard impact

The dashboard and global overview inherit the reclaimed shared-shell space. Their first actual content now starts after normal workspace padding rather than after a global dependency hero. No dashboard business markup was changed.

## K. Company module impact

Customers, Products & Services, Sales Opportunities, Quotations, Contracts, Finance, Accounting, Licensing placeholders, and Administration pages inherit the same shared wrapper behavior. No module behavior or page-specific warning was changed.

## L. FOPX impact

FOPX routes using `MainLayout` inherit the same full-width workspace and reclaimed vertical area. FOPX navigation and business behavior were not changed.

## M. Responsive impact

The shared wrapper uses responsive token breakpoints for the requested 1440+, 1280, 1024, and 800 layouts. Main canvas `min-w-0` and horizontal overflow handling remain in place, and table strategies were not changed.

## N. EN/AR/RTL impact

The obsolete global dependency strings were removed from both EN and AR. Header health labels remain localized. Logical CSS padding preserves RTL behavior without adding direction-specific offsets.

## O. Tests

- Focused shared-shell, enterprise-state, system-health, and backend-health tests: 4 files passed, 9 tests passed.
- Full frontend suite: 20 files passed, 67 tests passed.
- Coverage includes no degraded hero/reserved block, business content availability, compact header health state, backend-unavailable state, degraded-vs-unavailable detection, and continued polling after core API failure.

## P. TypeScript

`npx tsc --noEmit --pretty false` passed with no errors.

## Q. Production build

`npm run build` passed successfully. Vite transformed 2,542 modules and produced the production bundle.

## R. Remaining layout gaps

No shared-shell blocker remains. Page-specific spacing and max-width choices intentionally remain outside this focused task. The core unavailable state intentionally retains its controlled state presentation when the API itself is down.

## S. USER UAT checklist

- At 1440+, 1280, 1024, and 800 widths, confirm content begins directly below the header with no dependency hero or blank reserved region.
- With optional dependency degradation, confirm the normal business page remains usable and only the compact header shows `Degraded`.
- Stop the core API and confirm the existing `Unavailable` state and recovery behavior remain understandable after the service returns.
- Check Dashboard, Company modules, and FOPX workspace for reclaimed vertical space and full operational width.
- Check EN, AR, RTL, light theme, dark theme, and narrow/table-heavy screens for overflow or alignment issues.

## Final classification

UX REFINEMENT TASK 01 — IMPLEMENTED / READY FOR USER UAT
