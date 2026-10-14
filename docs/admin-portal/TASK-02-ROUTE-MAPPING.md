# Central Admin Task 02 — Route Mapping

The central shell introduces canonical `/admin` routes while preserving existing portal routes as redirects or legacy aliases. Existing FOPX domain screens remain the source of truth; unmounted modules use explicit unavailable states.

## Canonical global routes

| Route | Current implementation | Status |
| --- | --- | --- |
| `/admin` | Global structural overview | Available |
| `/admin/users` | Existing organizational users screen | Available |
| `/admin/access` | Access hub | Available |
| `/admin/access/groups` | Existing groups screen | Available |
| `/admin/access/roles` | Existing roles screen | Available |
| `/admin/access/approvals` | Existing admin approval queue | Available |
| `/admin/audit` | Explicit unavailable state | Placeholder; no global audit API |
| `/admin/notifications` | Existing notification templates screen | Available |
| `/admin/system` | Existing system configuration screen | Available; persistence remains legacy |
| `/admin/integrations` | Existing backend health signal | Available |
| `/admin/settings` | Explicit unavailable state | Placeholder |

## Canonical FOPX routes

| Route | Current implementation | Status |
| --- | --- | --- |
| `/admin/fopx/overview` | Existing dashboard | Available |
| `/admin/fopx/users` | Existing client list | Available |
| `/admin/fopx/users/:clientId` | Existing client details | Available |
| `/admin/fopx/conversations` | Existing support admin screen | Available; ownership remains pending |
| `/admin/fopx/moderation` | Existing moderation reports | Available |
| `/admin/fopx/notifications` | Existing notification broadcast screen | Available |
| `/admin/fopx/projects` | Explicit unavailable state | Placeholder |
| `/admin/fopx/opportunities` | Explicit unavailable state | Placeholder; backend exists, UI does not |
| `/admin/fopx/deals` | Explicit unavailable state | Placeholder |
| `/admin/fopx/funding` | Explicit unavailable state | Placeholder |
| `/admin/fopx/contracts` | Explicit unavailable state | Placeholder |
| `/admin/fopx/audit` | Explicit unavailable state | Placeholder; workspace audit API absent |
| `/admin/fopx/integrations` | Existing backend health signal | Available |
| `/admin/fopx/settings` | Explicit unavailable state | Placeholder; ownership pending |

## Legacy mappings

| Legacy route | Mapping |
| --- | --- |
| `/` | Redirects to `/admin` |
| `/dashboard` | Redirects to `/admin/fopx/overview` |
| `/clients` | Redirects to `/admin/fopx/users` |
| `/clients/:clientId` | Redirects to `/admin/fopx/users/:clientId` |
| `/users` | Redirects to `/admin/users` |
| `/groups` | Redirects to `/admin/access/groups` |
| `/roles` | Redirects to `/admin/access/roles` |
| `/admin-users/approval` | Redirects to `/admin/access/approvals` |
| `/system-config` | Redirects to `/admin/system` |
| `/config/notification-templates` | Redirects to `/admin/notifications` |
| `/support`, `/support-dashboard`, `/admin-support` | Retained legacy aliases; support ownership is not reclassified |
| `/operations/*` | Retained legacy FOPX operations routes |
| `/reference-data/*` | Retained legacy FOPX catalog routes |
| `/company-finance/*`, `/admin/company-finance/*` | Retained legacy finance routes; ownership remains pending |

No route in this task introduces NEXUS, workspace persistence, a plugin registry, a cross-product API, or new FOPX domain functionality.

