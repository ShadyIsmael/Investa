# Investa – Technical Debt & Known Issues

## Priority Issues

---

### 1. `CreditTransaction` Entity Naming (HIGH)

**Problem:** The `CreditTransaction` entity represents **credibility score changes**, not wallet money transactions. The name is deeply misleading and causes confusion across the codebase.

**Current situation:**
- `Client.Credit` = credibility score (decimal)
- `CreditTransaction` = audit trail of score changes (justification AR/EN, admin who made it)
- `AuthUser.WalletBalance` = actual monetary wallet balance
- `CreditPlanPurchase` = actual money transaction for buying credit plans

**Recommended fix:**
```
CreditTransaction → CredibilityTransaction (or ScoreTransaction)
```
Requires:
1. Rename entity class
2. Add EF Core migration: `RENAME TABLE CreditTransactions TO CredibilityTransactions`
3. Update all services, DTOs, controllers, AutoMapper mappings
4. Update frontend/mobile models

**Current workaround:** `ScoreTransactionsController.cs` was added to give a clearer API name.

---

### 2. Duplicate Message Entities (MEDIUM)

**Problem:** Two message entities co-exist in the domain:

| Entity | Namespace | Table | Status |
|---|---|---|---|
| `Message` | `Investa.Domain.Entities` | `Messages` | Legacy — may be unused in new chat flow |
| `ChatMessage` | `Investa.Domain.Entities.Chat` | `ChatMessages` | Active — used by ChatService, UnifiedSupportController |

**Current situation:** Both are registered in `ApplicationDbContext`. The `Messages` table may be stale data with no active writes.

**Recommended fix:**
1. Audit if any row is ever inserted into `Messages` table at runtime
2. If confirmed unused: remove `DbSet<Message> Messages`, add migration to drop/keep table
3. Keep only `ChatMessage` as the canonical message entity

---

### 3. AutoMapper Vulnerability (HIGH – Security)

**Package:** `AutoMapper 12.0.1`  
**Severity:** High (NU1903)  
**Advisory:** https://github.com/advisories/GHSA-rvv3-g6hj-g44x

**Recommended fix:** Upgrade AutoMapper to ≥ 13.0.0 (or switch to manual mapping / Mapster).

```xml
<!-- In Investa.Application.csproj -->
<PackageReference Include="AutoMapper" Version="13.0.0" />
```

> Note: AutoMapper 13.x has breaking API changes — review `MappingProfile.cs` after upgrade.

---

### 4. `DebugController` in Production (HIGH – Security)

**File:** `Core-BackEnd/Investa.API/Controllers/DebugController.cs`

Exposes `/api/debug/claims` and `/api/debug/health` — leaks JWT claim contents in a production environment.

**Recommended fix:** Guard with `[Authorize(Roles = "SuperAdmin")]` or delete entirely before production deployment.

---

### 5. Dual API Route Prefixes (LOW)

Many admin controllers register both `api/v1/admin/...` and `api/admin/...` routes:
```csharp
[Route("api/v1/admin/groups")]
[Route("api/admin/groups")]
```

This is not wrong, but doubles the surface area and makes the Swagger docs confusing.

**Recommended fix:** Pick one prefix (`api/v1/`) and update all frontend clients to use it, then remove the unversioned alias.

---

### 6. `Message` vs `ChatMessage` in Flutter (MEDIUM)

Both Flutter apps have `models/chat_message.dart` (local model) and use `ChatMessage` from the API. The local model should be kept consistent with the backend `ChatMessageDto`.

---

### 7. `InvestmentOpportunitiesController` is Empty (LOW)

**File:** `Core-BackEnd/Investa.API/Controllers/Admin/InvestmentOpportunitiesController.cs`

This controller exists but has no endpoints. It should either be populated or removed.

---

### 8. Null-Reference Warnings (LOW)

19 nullable reference warnings exist across the codebase (CS8600, CS8602, CS8603, CS8625). These are not runtime errors but indicate potential null-dereference bugs in:
- `ClientService.cs` (lines 23, 52, 70)
- `ChatService.cs` (line 42)
- `CategoryService.cs` (line 79)
- `InvestmentRequestService.cs` (lines 172, 182, 244, 254)
- `LookupService.cs` (line 153)
- `InvestmentsController.cs` (lines 256, 261, 304, 435)
- `DashboardController.cs` (line 87)

---

### 9. Flutter Founder `auth_flow/` Directory (RESOLVED)

The `Flutter_Founder/lib/auth_flow/` folder was an older auth implementation predating the clean architecture `features/auth/` module. It was unreferenced and has been deleted in this refactoring pass.

---

### 10. Scattered Business Rules (MEDIUM)

Business logic is leaking from the Application layer into controllers:
- `UnifiedSupportController.cs` directly accesses `_db.ChatMessages.AddAsync(...)` — bypasses service layer
- `DashboardController.cs` constructs response objects inline with direct DB calls

**Recommended fix:** Move all DB access and entity construction into Application service methods. Controllers should only call services.

---

## Completed Improvements (this refactoring pass)

- ✅ Deleted `DTOs/CreditTransactionDto.cs` (wrong fields) — consolidated to `DTOs.Profile.CreditTransactionDto`
- ✅ Deleted 3 dead Group DTOs (`GroupCreateDto`, `GroupUpdateDto`, `GroupListItemDto` in `DTOs/Groups/`)
- ✅ Deleted `Flutter_Founder/lib/auth_flow/` (dead legacy auth code)
- ✅ Deleted `auth_user.g.dart` (unreferenced pigeon-generated file)
- ✅ Deleted `widgets/signalr_demo.dart` from both Flutter apps (demo widget, not used)
- ✅ Removed `ApiBaseSwitcherComponent` from Angular client portal `AppComponent` (was exposed in production)
- ✅ Deleted `investa-client-portal/src/app/components/api-base-switcher/` (dev-only tool)
- ✅ Removed duplicate AutoMapper mapping `CreateMap<CreditTransaction, DTOs.CreditTransactionDto>()`
- ✅ Deleted ~50 leftover temp, diagnostic, refactoring-summary, and backup files across all layers
