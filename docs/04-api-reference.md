# Investa – API Reference

Base URL: `http://<host>:<port>`  
Auth: Bearer JWT (`Authorization: Bearer <token>`)

---

## Authentication – `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | None | Register with phone |
| POST | `/api/v1/auth/login` | None | Login with phone + OTP |
| POST | `/api/v1/auth/login-email` | None | Login with email + password |
| POST | `/api/v1/auth/sign-up` | None | Alternative sign-up flow |
| POST | `/api/v1/auth/refresh` | None | Refresh JWT token |
| POST | `/api/v1/auth/request-password-reset` | None | Initiate password reset |
| POST | `/api/v1/auth/reset-password` | None | Complete password reset |
| POST | `/api/v1/auth/change-password/send-otp` | Auth | Send OTP for password change |
| POST | `/api/v1/auth/change-password/confirm` | Auth | Confirm password change |
| POST | `/api/v1/auth/create-admin` | Admin | Create admin account |

---

## Profile – `/api/profile`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/profile/me` | Auth | Get own full profile |
| GET | `/api/profile/me/myprofile` | Auth | Get own profile (mobile view) |
| PUT | `/api/profile/me` | Auth | Update profile |
| POST | `/api/profile/me/basic` | Auth | Update basic info |
| POST | `/api/profile/me/initialize` | Auth | Initialize profile after registration |
| POST | `/api/profile/me/kyc/start` | Auth | Start KYC process |
| GET | `/api/profile/me/credits` | Auth | Get own credit transactions |
| GET | `/api/profile/{id}/public` | Auth | Get public profile of another user |
| GET | `/api/profile/debug` | Auth | Debug profile info |

---

## Investments – `/api/v1/investments`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/investments` | Auth | List all investments |
| POST | `/api/v1/investments` | Founder | Create investment |
| GET | `/api/v1/investments/{id}` | Auth | Get single investment |
| PUT | `/api/v1/investments/{id}` | Founder | Update investment |
| GET | `/api/v1/investments/me` | Founder | My investments |
| GET | `/api/v1/investments/GetMyInvestments` | Founder | My investments (alt) |
| GET | `/api/v1/investments/GetByCategory` | Auth | Filter by category |
| POST | `/api/v1/investments/{id}/favorite` | Auth | Toggle favorite |
| POST | `/api/v1/investments/{id}/purchase` | Partner | Purchase/invest |
| GET | `/api/v1/investments/{id}/participants` | Auth | List participants |
| GET | `/api/v1/investments/export` | Admin | Export investments |
| POST | `/api/v1/investments/{id}/images` | Founder | Upload images |
| DELETE | `/api/v1/investments/{id}/images/{imageId}` | Founder | Delete image |
| PUT | `/api/v1/investments/{id}/images/{imageId}/set-primary` | Founder | Set primary image |
| PUT | `/api/v1/investments/{id}/images/reorder` | Founder | Reorder images |

---

## Investment Events – `/api/investments/{investmentId}/events`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/investments/{id}/events` | Founder | Add event/update |
| GET | `/api/investments/{id}/events` | Auth | List events |

---

## Investment Requests – `/api/investment-requests`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/investment-requests` | Partner | Submit investment request |
| GET | `/api/investment-requests` | Auth | List requests (own) |

---

## Dashboard – `/api/dashboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Admin | Platform summary stats |
| GET | `/api/dashboard/my/metrics` | Auth | Personal metrics |
| GET | `/api/dashboard/my/credits` | Auth | My credit transactions |
| GET | `/api/dashboard/my/score-transactions` | Auth | My score transactions |
| GET | `/api/dashboard/my/top-engagements` | Auth | My top engagements |
| GET | `/api/dashboard/my/top-categories` | Auth | My top categories |

---

## Credit Plans – `/api/credit-plans`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/credit-plans` | Auth | List available plans |
| GET | `/api/credit-plans/admin` | Admin | List all plans (admin) |
| POST | `/api/credit-plans` | Admin | Create plan |
| PUT | `/api/credit-plans/{id}` | Admin | Update plan |
| DELETE | `/api/credit-plans/{id}` | Admin | Delete plan |
| POST | `/api/credit-plans/{id}/purchase` | Partner | Purchase a plan |
| GET | `/api/credit-plans/purchases/stats` | Admin | Purchase statistics |

---

## Score Transactions – `/api/v1/score-transactions`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/score-transactions` | Admin | Create score transaction for client |
| GET | `/api/v1/clients/{userId}/score-transactions` | Admin | Get client's score history |

---

## Support / Chat – `/api/support`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/support/sessions` | Auth | Initiate support session |
| POST | `/api/support/requests` | Auth | Submit support request |
| GET | `/api/support/sessions` | Admin | List all sessions |
| GET | `/api/support/conversations/active` | Admin | Get active conversations |
| GET | `/api/support/conversations/{id}` | Auth | Get conversation details |
| POST | `/api/support/conversations/{id}/messages` | Auth | Send message |
| POST | `/api/support/conversations/{id}/status` | Admin | Update session status |
| POST | `/api/support/sessions/{id}/messages` | Auth | Send message (alt) |

---

## Notifications – `/api/v1/user-notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/user-notifications` | Auth | List notifications |
| POST | `/api/v1/user-notifications/mark-read` | Auth | Mark as read |
| DELETE | `/api/v1/user-notifications/{id}` | Auth | Delete notification |

## Notification Templates – `/api/v1/notification-templates`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/notification-templates` | Admin | List templates |
| POST | `/api/v1/notification-templates` | Admin | Create template |
| PUT | `/api/v1/notification-templates/{id}` | Admin | Update template |
| DELETE | `/api/v1/notification-templates/{id}` | Admin | Delete template |
| POST | `/api/v1/notification-templates/send` | Admin | Send a notification |

---

## Categories (Public) – `/api/v1/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/categories` | None | List categories |
| GET | `/api/v1/categories/{id}` | None | Get category |

---

## Lookups – `/api/v1/lookups`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/lookups/business-stages` | None | Business stages list |
| GET | `/api/v1/lookups/business-categories` | None | Business categories |
| GET | `/api/v1/lookups/project-phases` | None | Project phases |
| GET | `/api/v1/lookups` | None | All lookups |

---

## Clients (Internal) – `/api/clients`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/clients/{userId}` | Admin | Get client by ID |
| GET | `/api/clients/by-phone/{phone}` | Admin | Find by phone |
| PUT | `/api/clients/{userId}` | Admin | Update client |

---

## Users – `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/users/fcm-token` | Auth | Register FCM device token |

---

## Admin – Categories `/api/v1/admin/categories`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/categories` | Admin | List categories |
| POST | `/api/v1/admin/categories` | Admin | Create |
| PUT | `/api/v1/admin/categories/{id}` | Admin | Update |
| DELETE | `/api/v1/admin/categories/{id}` | Admin | Delete |

## Admin – Users `/api/v1/admin/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/users` | Admin | Paged user list |
| GET | `/api/v1/admin/users/list` | Admin | Full list |
| POST | `/api/v1/admin/users` | Admin | Create user |
| PUT | `/api/v1/admin/users/{userId}` | Admin | Update user |
| DELETE | `/api/v1/admin/users/{userId}` | Admin | Delete user |
| POST | `/api/v1/admin/users/bulk-update-status` | Admin | Bulk status change |

## Admin – Groups `/api/v1/admin/groups`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/groups/all` | Admin | All groups |
| GET | `/api/v1/admin/groups/list` | Admin | Group list |
| POST | `/api/v1/admin/groups` | Admin | Create group |
| PUT | `/api/v1/admin/groups/{id}` | Admin | Update group |
| DELETE | `/api/v1/admin/groups/{id}` | Admin | Delete group |
| GET | `/api/v1/admin/groups/{id}/permissions` | Admin | Group permissions |
| POST | `/api/v1/admin/groups/{id}/permissions` | Admin | Update permissions |
| POST | `/api/v1/admin/groups/{id}/users/{userId}` | Admin | Add user to group |
| DELETE | `/api/v1/admin/groups/{id}/users/{userId}` | Admin | Remove user from group |

## Admin – Roles `/api/v1/admin/roles`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/roles` | Admin | All roles |
| POST | `/api/v1/admin/roles` | Admin | Create role |
| PUT | `/api/v1/admin/roles/{roleId}` | Admin | Update role |
| DELETE | `/api/v1/admin/roles/{roleId}` | Admin | Delete role |
| GET | `/api/v1/admin/roles/{roleId}/permissions` | Admin | Role permissions |
| POST | `/api/v1/admin/roles/{roleId}/permissions` | Admin | Assign permissions |
| GET | `/api/v1/admin/roles/{roleId}/users` | Admin | Users with role |
| POST | `/api/v1/admin/roles/{roleId}/users` | Admin | Assign user to role |
| DELETE | `/api/v1/admin/roles/{roleId}/users/{userId}` | Admin | Remove user from role |

## Admin – Dashboard `/api/v1/admin/dashboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/admin/dashboard/{userId}/timeseries` | Admin | User activity timeseries |
| GET | `/api/v1/admin/dashboard/org/timeseries` | Admin | Org-wide timeseries |
| GET | `/api/v1/admin/dashboard/{userId}/credits` | Admin | User credit history |
| GET | `/api/v1/admin/dashboard/top-clients` | Admin | Top clients by score |
| GET | `/api/v1/admin/dashboard/investments/stats/by-category` | Admin | Investment stats |

---

## Health – `/api/health`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Health check |
| GET | `/api/health/ping` | None | Ping |

---

## Notes

- All admin routes are duplicated with and without `v1` prefix for backwards compatibility.
- `DebugController` (`/api/debug/claims`) should be removed before production deployment.
- Route prefix inconsistency: some controllers use `api/v1/` (versioned), others use `api/` (unversioned). Consider standardizing.
