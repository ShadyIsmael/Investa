# Investa – Domain Model

## Core Entities

### AuthUser (Identity)
> Table: `AspNetUsers`

Central user record, extends ASP.NET Identity.

| Field | Type | Purpose |
|---|---|---|
| Id | Guid | Primary key |
| UserType | enum | `Founder` or `Partner` |
| PhoneNumber | string | Login identifier |
| WalletBalance | decimal | Monetary credit balance |
| DeviceToken | string | FCM push token |
| IsKycVerified | bool | Whether KYC is complete |
| IsActive | bool | Account status |

---

### Client
> Table: `Clients`

Extended profile for all platform users (both founders and partners).

| Field | Type | Purpose |
|---|---|---|
| Id | Guid | FK → AuthUser.Id |
| FirstName / LastName | string | Display name |
| Credit | decimal | **Credibility score** (NOT wallet money) |
| CurrentCredibilityScore | decimal | Running credibility total |
| KycCompleted | bool | |
| UserType | string | Mirrors AuthUser.UserType |
| CompanyName / HrLetter | string | Business identity |
| DateOfBirth / Country | string | Personal info |

> **Note:** `Client.Credit` is the credibility score. `AuthUser.WalletBalance` is real money/credits.

---

### Investment
> Table: `Investments`

An investment opportunity posted by a founder.

| Field | Type | Purpose |
|---|---|---|
| Id | Guid | PK |
| FounderId | Guid | FK → AuthUser |
| Title / Description | string | |
| InvestmentType | enum | `Debt`, `Equity`, `RealEstate`, `EquityCrowdfunding` |
| TargetAmount | decimal | Funding goal |
| Status | enum | `Draft`, `Pending`, `Active`, `Funded`, `Rejected` |
| Images | List<InvestmentImage> | Media |
| TeamMembers | List<InvestmentTeamMember> | |
| IsFavorited | computed | Per-user favorite status |

---

### InvestmentRequest
> Table: `InvestmentRequests`

A partner's request to invest in an opportunity.

| Field | Type | Purpose |
|---|---|---|
| Id | Guid | PK |
| InvestmentId | Guid | FK → Investment |
| PartnerId | Guid | FK → AuthUser |
| Amount | decimal | Requested amount |
| Status | enum | `Pending`, `Approved`, `Rejected` |
| RequestType | enum | Investment type-specific |

---

### CreditTransaction
> Table: `CreditTransactions`

Audit log of credibility score changes for a client. **Not wallet money.**

| Field | Type | Purpose |
|---|---|---|
| Id | int | PK |
| UserId | Guid | FK → Client |
| Amount | decimal | Score delta (+ or –) |
| JustificationAr / En | string | Reason for change |
| AdminId | Guid? | Admin who made the change |
| CreatedAt | DateTime | |

> Distinct from `AuthUser.WalletBalance`. See [technical-debt.md](./06-technical-debt.md) for rename recommendation.

---

### CreditPlan / CreditPlanPurchase
> Tables: `CreditPlans`, `CreditPlanPurchases`

Purchasable credit plans that add to `AuthUser.WalletBalance`.

---

### SupportSession
> Table: `SupportSessions`

A support thread between a user and an admin agent.

| Field | Type | Purpose |
|---|---|---|
| Id | Guid | PK |
| UserId | Guid | FK → AuthUser |
| Status | enum | `Open`, `Closed` |

---

### ChatMessage (Chat Module)
> Table: `ChatMessages`  
> Namespace: `Investa.Domain.Entities.Chat`

Encrypted messages within a `SupportSession`. Uses AES-GCM encryption.

| Field | Type | Purpose |
|---|---|---|
| Id | Guid | PK |
| SupportSessionId | Guid | FK → SupportSession |
| SenderId | string | User ID |
| EncryptedContent | string | AES-GCM encrypted text |
| KeyId | string | Encryption key reference |
| SentAt | DateTime | |

---

### Message (Legacy Support Messages)
> Table: `Messages`  
> Namespace: `Investa.Domain.Entities`

Older message entity linked to `SupportSession`. Coexists with `ChatMessage`. See [technical-debt.md](./06-technical-debt.md).

---

### RBAC Entities

| Entity | Table | Purpose |
|---|---|---|
| `Group` | `Groups` | Organizational unit (e.g. "Admins") |
| `Role` | `AspNetRoles` | System role |
| `Permission` | `Permissions` | Fine-grained action |
| `RolePermission` | `RolePermissions` | Role ↔ Permission mapping |
| `GroupRole` | `GroupRoles` | Group ↔ Role binding |
| `UserGroup` | `UserGroups` | User ↔ Group membership |

---

### Notification
> Table: `Notifications`

In-app notification record per user.

---

### UserProfile / ProfileChangeAudit
Stores extended profile data and tracks all profile edits for audit purposes.

---

## Key Relationships

```
AuthUser ──1:1──► Client (profile + credibility score)
AuthUser ──1:N──► Investment (founder creates many)
AuthUser ──1:N──► InvestmentRequest (partner makes many)
AuthUser ──1:N──► CreditTransaction (credibility history)
AuthUser ──1:N──► SupportSession
SupportSession ──1:N──► ChatMessage
AuthUser ──M:N──► Group (via UserGroup)
Group ──M:N──► Role (via GroupRole)
Role ──M:N──► Permission (via RolePermission)
Investment ──1:N──► InvestmentRequest
Investment ──1:N──► InvestmentImage
Investment ──1:N──► InvestmentTeamMember
```
