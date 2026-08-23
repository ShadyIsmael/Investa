# Investa Documentation

This directory is the single home for system documentation, setup guides, technical reports, and project notes. Application-level `README.md` files remain beside their applications so that local setup instructions are easy to find.

## Core system documentation

| Document | Contents |
|---|---|
| [System overview](./01-system-overview.md) | Architecture, applications, technology stack, and deployment |
| [Domain model](./02-domain-model.md) | Entities, fields, purposes, and relationships |
| [Features inventory](./03-features-inventory.md) | Implemented business features by domain |
| [API reference](./04-api-reference.md) | Backend REST endpoints and authorization |
| [Technical debt](./05-technical-debt.md) | Known issues, security concerns, and recommended fixes |
| [Development guide](./06-development-guide.md) | Local setup, workflow, and development patterns |
| [Project TODO](./project/TODO.md) | Outstanding project work |

## Documentation by component

| Area | Contents |
|---|---|
| [Backend](./backend/) | Database setup, chat encryption, Firebase, RBAC, seed data, and supporting SQL/SVG files |
| [Admin portal](./admin-portal/) | Architecture, permissions, notifications, migration, setup, and security |
| [Client portal](./client-portal/) | Code reviews, refactoring plans, UI redesigns, and implementation reports |
| [Flutter Founder](./flutter-founder/) | Quick start, clean architecture, API reference, dashboard redesign, and issue records |
| [Flutter Partner](./flutter-partner/) | Investment-flow documentation, quick reference, and issue records |

## Architecture and technical notes

| Area | Contents |
|---|---|
| [Architecture](./architecture/) | Project/funding redesign phases and lifecycle decisions |
| [Technical](./technical/) | Platform upgrades and technical implementation notes |
| [Reports](./reports/) | Audits and completed-fix summaries |

## Naming quick reference

- `Client.Credit` is the credibility score, not money.
- `AuthUser.WalletBalance` is the monetary balance.
- `CreditTransaction` records credibility-score changes, not financial transactions.

See the [domain model](./02-domain-model.md) and [technical debt report](./05-technical-debt.md) for details.
