# Investa – Documentation Index

Welcome to the Investa platform documentation. These documents were generated during the deep refactoring pass on branch `refactor/deep-cleanup-and-docs`.

---

## Documents

| # | File | Contents |
|---|---|---|
| 01 | [System Overview](./01-system-overview.md) | Architecture diagram, all layers, tech stack, deployment |
| 02 | [Domain Model](./02-domain-model.md) | All entities, their fields, purposes, and relationships |
| 03 | [Features Inventory](./03-features-inventory.md) | All implemented business features per domain |
| 04 | [API Reference](./04-api-reference.md) | All backend REST endpoints (method, path, auth, description) |
| 05 | [Technical Debt](./05-technical-debt.md) | Known issues, naming confusions, security concerns, recommended fixes |
| 06 | [Development Guide](./06-development-guide.md) | How to run each app, environment setup, git workflow, patterns |

---

## Quick Reference

### Core Business Entities
- **AuthUser** — identity, wallet balance, FCM token
- **Client** — extended profile, **credibility score**
- **Investment** — opportunity created by a founder
- **InvestmentRequest** — partner's engagement with an investment
- **CreditTransaction** — credibility score change log *(name is misleading — see [technical-debt.md](./05-technical-debt.md))*
- **CreditPlan** — purchasable credit package
- **SupportSession + ChatMessage** — encrypted support chat

### User Types
- **Founder** — creates investments, manages profile/team
- **Partner** — browses and invests, purchases credit plans
- **Admin** — manages all via admin portal (RBAC controlled)

### Key Naming Confusion (READ THIS)
> `Client.Credit` ≠ money. It is the **credibility score**.  
> `AuthUser.WalletBalance` = actual money/credit.  
> `CreditTransaction` = credibility score audit trail, NOT a financial transaction.  
> See [02-domain-model.md](./02-domain-model.md) and [05-technical-debt.md](./05-technical-debt.md).
