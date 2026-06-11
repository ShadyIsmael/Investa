# Investment Request Workflow Audit Report

**Audit Date:** June 11, 2026  
**Auditor:** Cascade AI  
**Scope:** Angular Client Portal, Flutter Founder App, Flutter Partner App, Backend API  
**Objective:** Validate the existing Investment Request Workflow across all platforms and identify gaps

---

## Executive Summary

This audit reveals **CRITICAL GAPS** in the Investment Request Workflow implementation. While the backend has partial implementation of request creation, approval, and rejection, the frontend applications have incomplete or non-functional approval/rejection flows. Most critically, **chat creation between founder and investor after request approval is completely missing** from the backend.

**Overall Status:** ❌ **INCOMPLETE** - Workflow cannot function end-to-end as designed

---

## Phase 1: Learn More Credit Deduction

### Angular Client Portal
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `investments.component.ts` (lines 420-468): `confirmEngage()` method
- Validates credits locally before API call
- Calls `requestsService.createInvestmentRequest(investment, engagementCreditCost, 0)`
- Refreshes user profile after successful request
- Credit cost: 5 credits (ENGAGEMENT_CREDIT_COST constant)

**Evidence:**
```typescript
// Line 446-447
this.requestsService
  .createInvestmentRequest(investment, this.engagementCreditCost, 0)
```

### Flutter Partner App
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `investments_screen.dart` (lines 386-482): `_handleEngage()` method
- `investment_info_screen.dart` (lines 109-202): `_handleInvest()` method
- Validates credits locally via `profileService.fetchProfile()`
- Calls `requestsService.createInvestmentRequest()`
- Refreshes profile after successful request
- Credit cost: Configured via `Env.engageCreditCost`

**Evidence:**
```dart
// investments_screen.dart lines 421-425
await requestsService.createInvestmentRequest(
  investment: widget.item,
  amount: engagementCost,
  shares: 0, // Engagement/Funding type has 0 shares
);
```

### Backend
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `InvestmentRequestService.cs` (lines 35-208): `CreateInvestmentRequestAsync()`
- Validates investment exists
- Validates investor account exists
- Validates sufficient credits
- Deducts credits via `CreditService.CreateTransactionAsync()`
- Creates InvestmentRequest record with status Pending
- Sends notification to founder
- Returns updated credit balance

**Evidence:**
```csharp
// Lines 62-67
await _creditService.CreateTransactionAsync(investorId, -dto.Amount, "debit", descriptionEn);
```

### Critical Finding: Duplicate Request Validation
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:** Backend does not validate if the same investor already has a pending request for the same investment. This allows duplicate requests.

**Expected Behavior:** 
- Opening the SAME investment multiple times must NOT repeatedly deduct credits
- Credit deduction should occur once per investment per user

**Current Behavior:** 
- No validation exists in `CreateInvestmentRequestAsync`
- Each call creates a new InvestmentRequest record
- Credits are deducted each time

**Recommendation:** Add duplicate request validation before credit deduction:
```csharp
// Check for existing pending request
var existingRequest = await _unitOfWork.Repository<InvestmentRequest>()
    .FindAsync(r => r.InvestmentId == dto.InvestmentId 
                && r.InvestorId == investorId 
                && r.Status == InvestmentRequestStatus.Pending)
    .FirstOrDefaultAsync();

if (existingRequest != null)
{
    throw new InvalidOperationException("You already have a pending request for this investment");
}
```

---

## Phase 2: Investment Request Creation

### Angular Client Portal
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `requests.service.ts` (lines 105-163): `createInvestmentRequest()`
- Calls backend API: `POST /api/investment-requests`
- Payload: `{ investmentId, amount, shares }`
- Refreshes user credits after successful creation
- Updates local outgoing requests state

**Evidence:**
```typescript
// Lines 121-125
const response = await firstValueFrom(this.http.post<any>(
  `${this.apiBase}/api/investment-requests`, 
  { investmentId: investment.id, amount, shares: shares > 0 ? shares : undefined }, 
  this.getHttpOptions()
));
```

### Flutter Partner App
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `requests_service.dart` (lines 300-546): `createInvestmentRequest()`
- Calls backend API: `POST /api/investment-requests`
- Payload: `{ investmentId, amount, shares }`
- Refreshes profile after successful creation
- Updates local outgoing requests state

**Evidence:**
```dart
// Lines 359-373
final payload = <String, dynamic>{
  'investmentId': investmentIdInt,
  'amount': amount,
};
if (shares > 0) {
  payload['shares'] = shares;
}
final resp = await _apiClient.post(endpoint, data: payload);
```

### Flutter Founder App
**Status:** ❌ **NOT APPLICABLE** (Founders create investments, not requests)

### Backend
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `InvestmentRequestsController.cs` (lines 30-68): `CreateInvestmentRequest` endpoint
- `InvestmentRequestService.cs` (lines 35-208): `CreateInvestmentRequestAsync()`
- Creates InvestmentRequest with:
  - InvestmentId, InvestorId, FounderId
  - Amount, Shares
  - Status: Pending
  - Direction: Outgoing
  - RequestType: "investment_request"
- Deducts credits
- Sends notification to founder

**Evidence:**
```csharp
// Lines 76-87
var request = new InvestmentRequest
{
    InvestmentId = investment.Id,
    InvestorId = investorId,
    FounderId = investment.FounderId,
    Amount = dto.Amount,
    Shares = dto.Shares,
    Status = InvestmentRequestStatus.Pending,
    Direction = InvestmentRequestDirection.Outgoing,
    RequestType = "investment_request",
    CreatedAt = DateTime.UtcNow
};
```

### Request Data Validation
**Status:** ✅ **CORRECT**

All required fields are present:
- InvestmentId ✅
- InvestorId ✅
- FounderId ✅
- Amount ✅
- Shares ✅
- Status ✅
- CreatedAt ✅

---

## Phase 3: Request Approval Workflow

### Angular Client Portal
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:** 
- `requests.service.ts` (lines 169-184): `acceptRequest()` has TODO comment
- No API call implemented
- Only updates local state

**Evidence:**
```typescript
// Lines 171-172 - TODO comment
// TODO: Implement API call
// await firstValueFrom(this.http.put(`${this.apiBase}/api/investment-requests/${request.id}/accept`, {}, this.getHttpOptions()));
```

### Flutter Founder App
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:**
- `requests_screen.dart` (lines 187-194): Calls `_service.acceptRequest(id)`
- But `requests_service.dart` (lines 257-262) only updates local mock state
- No API call to backend

**Evidence:**
```dart
// requests_screen.dart lines 187-190
onAccept: (id) async {
  await _service.acceptRequest(id);
  await _loadAll();
},

// requests_service.dart lines 257-262
Future<void> acceptRequest(String id) async {
  await Future.delayed(const Duration(milliseconds: 300));
  final it = _income.firstWhere((e) => e.id == id, orElse: () => throw StateError('Not found'));
  it.status = RequestStatus.accepted;
}
```

### Flutter Partner App
**Status:** ❌ **NOT APPLICABLE** (Partners don't approve requests)

### Backend
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `InvestmentRequestsController.cs` (lines 109-149): `ApproveInvestmentRequest` endpoint
- `InvestmentRequestService.cs` (lines 284-382): `ApproveInvestmentRequestAsync()`
- Validates:
  - Request exists
  - User is the founder
  - Request is pending
- Updates status to Accepted
- Creates/updates InvestmentParticipant record
- Sends notification to investor

**Evidence:**
```csharp
// Lines 306-309
request.Status = InvestmentRequestStatus.Accepted;
request.UpdatedAt = DateTime.UtcNow;
await _unitOfWork.SaveChangesAsync();

// Lines 312-329 - Create InvestmentParticipant
var existingParticipant = (await _unitOfWork.Repository<InvestmentParticipant>()
    .FindAsync(p => p.InvestmentId == request.InvestmentId && p.InvestorId == request.InvestorId))
    .FirstOrDefault();

if (existingParticipant == null)
{
    var participant = new InvestmentParticipant
    {
        InvestmentId = request.InvestmentId,
        InvestorId = request.InvestorId,
        SharesPurchased = request.Shares ?? 0,
        AmountInvested = request.Amount,
        InvestmentDate = DateTime.UtcNow,
        Status = ParticipationLifecycle.Approved,
        CreatedAt = DateTime.UtcNow
    };
    await _unitOfWork.Repository<InvestmentParticipant>().AddAsync(participant);
}
```

### CRITICAL GAP: Chat Creation
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:** 
- `ApproveInvestmentRequestAsync()` does NOT create a chat room between founder and investor
- `ChatService.cs` only handles SupportSession for admin support chat
- No chat creation logic exists for founder-investor communication

**Expected Behavior:**
- When request is approved, a chat room should be automatically created
- Chat should include both founder and investor as participants
- Both users should be able to access the chat

**Current Behavior:**
- No chat is created
- InvestmentParticipant is created but no communication channel exists
- Founder and investor cannot communicate after approval

**Recommendation:** Add chat creation to approval flow:
```csharp
// After approving request, create chat room
var chatService = _serviceProvider.GetRequiredService<IChatService>();
var conversation = await chatService.CreateConversationAsync(
    request.FounderId,
    request.InvestorId,
    $"Investment: {investment.BusinessName}"
);
```

---

## Phase 4: Request Rejection Workflow

### Angular Client Portal
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:**
- `requests.service.ts` (lines 190-205): `declineRequest()` has TODO comment
- No API call implemented
- Only updates local state

**Evidence:**
```typescript
// Lines 192-193 - TODO comment
// TODO: Implement API call
// await firstValueFrom(this.http.put(`${this.apiBase}/api/investment-requests/${request.id}/decline`, {}, this.getHttpOptions()));
```

### Flutter Founder App
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:**
- `requests_screen.dart` (lines 191-194): Calls `_service.declineRequest(id)`
- But `requests_service.dart` (lines 264-269) only updates local mock state
- No API call to backend

**Evidence:**
```dart
// requests_service.dart lines 264-269
Future<void> declineRequest(String id) async {
  await Future.delayed(const Duration(milliseconds: 300));
  final it = _income.firstWhere((e) => e.id == id, orElse: () => throw StateError('Not found'));
  it.status = RequestStatus.declined;
}
```

### Flutter Partner App
**Status:** ❌ **NOT APPLICABLE** (Partners don't reject requests)

### Backend
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `InvestmentRequestsController.cs` (lines 154-194): `RejectInvestmentRequest` endpoint
- `InvestmentRequestService.cs` (lines 384-480): `RejectInvestmentRequestAsync()`
- Validates:
  - Request exists
  - User is the founder
  - Request is pending
- Updates status to Declined
- Refunds credits to investor
- Updates InvestmentParticipant status if exists
- Sends notification to investor

**Evidence:**
```csharp
// Lines 406-409
request.Status = InvestmentRequestStatus.Declined;
request.UpdatedAt = DateTime.UtcNow;
await _unitOfWork.SaveChangesAsync();

// Lines 412-419 - Refund credits
await _creditService.CreateTransactionAsync(request.InvestorId, request.Amount, "credit", descriptionEn);
```

### Chat Creation on Rejection
**Status:** ✅ **CORRECTLY NOT IMPLEMENTED**

**Finding:** Chat should NOT be created on rejection. Backend correctly does not create chat when request is rejected.

---

## Phase 5: Request Cancellation/Revocation Behavior

### Angular Client Portal
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:**
- `requests.service.ts` (lines 211-232): `withdrawRequest()` has TODO comment
- No API call implemented
- Only updates local state

**Evidence:**
```typescript
// Lines 213-214 - TODO comment
// TODO: Implement API call with credit refund
// await firstValueFrom(this.http.delete(`${this.apiBase}/api/investment-requests/${request.id}`, this.getHttpOptions()));
```

### Flutter Founder App
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:**
- `requests_screen.dart` (lines 195-198): Calls `_service.cancelRequest(id)`
- But `requests_service.dart` (lines 271-276) only updates local mock state
- No API call to backend

**Evidence:**
```dart
// requests_service.dart lines 271-276
Future<void> cancelRequest(String id) async {
  await Future.delayed(const Duration(milliseconds: 300));
  final it = _outcome.firstWhere((e) => e.id == id, orElse: () => throw StateError('Not found'));
  it.status = RequestStatus.canceled;
}
```

### Flutter Partner App
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:** Same as Flutter Founder - only local state update

### Backend
**Status:** ❌ **NOT IMPLEMENTED**

**Issue:** No endpoint exists for request cancellation/withdrawal

**Expected Behavior:**
- Investor should be able to cancel pending requests
- Credits should be refunded on cancellation
- Request status should change to Withdrawn

**Current Behavior:**
- No cancellation endpoint exists
- No way for investors to cancel their requests
- No refund mechanism for cancellation

**Recommendation:** Implement cancellation endpoint:
```csharp
[HttpPost("{requestId}/cancel")]
public async Task<IActionResult> CancelInvestmentRequest(int requestId)
{
    // Validate request exists
    // Validate user is the investor
    // Validate request is pending
    // Update status to Withdrawn
    // Refund credits
    // Send notification to founder
}
```

---

## Phase 6: Notification Delivery

### Backend
**Status:** ✅ **IMPLEMENTED**

**Implementation:**
- `NotificationService.cs`: Firebase Cloud Messaging
- `InvestmentRequestService.cs` sends notifications for:
  - Request sent (to founder) - lines 124-141
  - Request approved (to investor) - lines 345-356
  - Request rejected (to investor) - lines 443-454

**Evidence:**
```csharp
// Request sent notification (lines 124-141)
await _notificationService.SendNotificationAsync(
    investment.FounderId.ToString(),
    "New Investment Request",
    $"{investorName} wants to invest {dto.Amount:N0} EGP in {investmentName}",
    new Dictionary<string, string>
    {
        ["requestId"] = request.Id.ToString(),
        ["investmentId"] = investment.Id.ToString(),
        ["type"] = "investment_request",
        ["action"] = "new_request"
    }
);

// Request approved notification (lines 345-356)
await _notificationService.SendNotificationAsync(
    request.InvestorId.ToString(),
    "Investment Request Approved",
    $"Your investment request for {investmentName} has been approved",
    new Dictionary<string, string>
    {
        ["requestId"] = request.Id.ToString(),
        ["investmentId"] = request.InvestmentId.ToString(),
        ["type"] = "investment_request",
        ["action"] = "approved"
    }
);

// Request rejected notification (lines 443-454)
await _notificationService.SendNotificationAsync(
    request.InvestorId.ToString(),
    "Investment Request Rejected",
    $"Your investment request for {investmentName} has been rejected",
    new Dictionary<string, string>
    {
        ["requestId"] = request.Id.ToString(),
        ["investmentId"] = request.InvestmentId.ToString(),
        ["type"] = "investment_request",
        ["action"] = "rejected"
    }
);
```

### Notification Data Payload
**Status:** ✅ **CORRECT**

All notifications include:
- requestId ✅
- investmentId ✅
- type: "investment_request" ✅
- action: "new_request"/"approved"/"rejected" ✅

### Frontend Notification Handling
**Status:** ❌ **NOT VALIDATED**

**Issue:** 
- Flutter apps have FCM service implementations
- Angular has notification service
- **NOT VALIDATED** if frontend properly handles these notification types
- **NOT VALIDATED** if notification badge counts update correctly

**Recommendation:** Validate frontend notification handling for:
- Request sent notifications (Flutter Founder)
- Request approved notifications (Flutter Partner)
- Request rejected notifications (Flutter Partner)
- Notification badge count updates
- Notification persistence

---

## Phase 7: Chat Creation Workflow

### Backend
**Status:** ❌ **NOT IMPLEMENTED**

**Critical Finding:** Chat creation between founder and investor is completely missing

**Current Chat Implementation:**
- `ChatService.cs` only handles `SupportSession` for admin support chat
- `Conversation.cs` entity exists but only used for admin support
- `ConversationParticipant.cs` exists but only used for admin support
- No chat creation logic exists for founder-investor communication

**Expected Behavior:**
- When request is approved, create a chat room
- Add founder and investor as participants
- Both users should be able to access the chat
- Chat should be linked to the investment

**Current Behavior:**
- No chat is created on approval
- No communication channel exists between founder and investor
- InvestmentParticipant is created but no way to communicate

**Recommendation:** Implement chat creation in approval flow:
1. Create `Conversation` entity for founder-investor chat
2. Create `ConversationParticipant` records for both users
3. Link conversation to investment
4. Add chat creation to `ApproveInvestmentRequestAsync()`

---

## Phase 8: UX Review

### Angular Client Portal
**Status:** ⚠️ **PARTIAL**

**Findings:**
- ✅ Investment browsing works
- ✅ Engagement flow with credit deduction works
- ✅ Request creation works
- ❌ Request approval buttons exist but don't work (TODO)
- ❌ Request rejection buttons exist but don't work (TODO)
- ❌ Request withdrawal buttons exist but don't work (TODO)
- ⚠️ Chat component exists but is mock data (not connected to backend)

**Evidence:**
```typescript
// requests.component.ts lines 34-39
accept(request: InvestmentRequest) {
  this.requestsService.acceptRequest(request);
}

decline(request: InvestmentRequest) {
  this.requestsService.declineRequest(request);
}

withdraw(request: InvestmentRequest) {
  this.requestsService.withdrawRequest(request);
}
```

### Flutter Founder App
**Status:** ⚠️ **PARTIAL**

**Findings:**
- ✅ Investment creation works
- ✅ Requests screen displays incoming/outgoing requests
- ✅ Accept/Decline/Cancel buttons exist
- ❌ Accept/Decline/Cancel only update local state (no API calls)
- ✅ Support chat works (admin support)
- ❌ No founder-investor chat

**Evidence:**
```dart
// requests_screen.dart lines 187-198
onAccept: (id) async {
  await _service.acceptRequest(id);  // Only local state update
  await _loadAll();
},
onDecline: (id) async {
  await _service.declineRequest(id);  // Only local state update
  await _loadAll();
},
```

### Flutter Partner App
**Status:** ⚠️ **PARTIAL**

**Findings:**
- ✅ Investment browsing works
- ✅ Engagement flow with credit deduction works
- ✅ Request creation works
- ✅ Investment details screen works
- ❌ No request approval/rejection UI (not applicable for partners)
- ✅ Support chat works (admin support)
- ❌ No founder-investor chat

**Evidence:**
```dart
// investments_screen.dart lines 386-482
Future<void> _handleEngage() async {
  // Refresh profile
  await profileService.fetchProfile();
  // Show confirmation dialog
  // Create request
  await requestsService.createInvestmentRequest(...);
  // Show success message
}
```

### Cross-Platform Consistency
**Status:** ❌ **INCONSISTENT**

**Issues:**
- Angular has approval/rejection UI but doesn't work
- Flutter Founder has approval/rejection UI but doesn't work
- Flutter Partner doesn't need approval/rejection UI
- All platforms have different request screen implementations
- Chat implementation inconsistent (only support chat exists)

---

## Critical Findings Summary

### Critical Severity (Must Fix)
1. ❌ **Chat Creation Missing**: No chat room created between founder and investor after request approval
2. ❌ **Approval Not Implemented**: Angular and Flutter Founder approval buttons don't call backend API
3. ❌ **Rejection Not Implemented**: Angular and Flutter Founder rejection buttons don't call backend API
4. ❌ **Cancellation Not Implemented**: No way for investors to cancel pending requests
5. ❌ **Duplicate Request Validation Missing**: Backend allows multiple requests for same investment

### High Severity (Should Fix)
6. ❌ **Notification Handling Not Validated**: Frontend notification handling not validated
7. ❌ **Cross-Platform Inconsistency**: Different UI implementations across platforms
8. ❌ **Credit Deduction Not Idempotent**: Opening same investment multiple times deducts credits each time

### Medium Severity (Nice to Fix)
9. ⚠️ **Chat Component Mock Data**: Angular chat component uses mock data
10. ⚠️ **Request Status Inconsistency**: Different status values across platforms

---

## Recommended Fixes

### Priority 1: Implement Chat Creation
**File:** `InvestmentRequestService.cs`  
**Method:** `ApproveInvestmentRequestAsync()`  
**Action:** Add chat creation after approval

### Priority 2: Implement Approval API Calls
**Files:**
- `investa-client-portal/src/app/services/requests.service.ts`
- `Flutter_Founder/lib/services/requests_service.dart`

**Action:** Replace TODO comments with actual API calls to `/api/investment-requests/{id}/approve`

### Priority 3: Implement Rejection API Calls
**Files:**
- `investa-client-portal/src/app/services/requests.service.ts`
- `Flutter_Founder/lib/services/requests_service.dart`

**Action:** Replace TODO comments with actual API calls to `/api/investment-requests/{id}/reject`

### Priority 4: Implement Cancellation
**Backend:** Add cancellation endpoint  
**Frontend:** Implement cancellation UI and API calls

### Priority 5: Add Duplicate Request Validation
**File:** `InvestmentRequestService.cs`  
**Method:** `CreateInvestmentRequestAsync()`  
**Action:** Check for existing pending request before creating new one

---

## Conclusion

The Investment Request Workflow is **incomplete and non-functional** for the approval/rejection flow. While request creation works correctly, the critical approval/rejection functionality is not implemented in the frontend applications. Most critically, chat creation between founder and investor is completely missing from the backend, which breaks the core business flow of enabling communication after approval.

**Recommendation:** Implement the critical fixes in Priority 1-5 before releasing the workflow to production.

---

**Report Generated By:** Cascade AI  
**Report Version:** 1.0  
**Last Updated:** June 11, 2026
