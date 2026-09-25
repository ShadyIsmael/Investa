# Founder Project Dashboard Redesign (Product V2)

## Executive Summary

Redesign the Founder Dashboard from a statistics page to an **operational workspace** that answers: **"What is the current state of my project, and what do I need to do next?"**

---

## 1. Current Widgets Analysis

| Current Widget | Location | Decision | Rationale |
|---|---|---|---|
| Welcome Header | `dashboard_screen.dart:72-78` | **Keep** | Standard greeting, low cognitive load |
| Score Card (Credit Points + Credibility Score) | `dashboard_screen.dart:144-172` | **Remove** | Not actionable; duplicates profile screen data |
| 2x2 Stat Grid | `dashboard_screen.dart:92-119` | **Replace** | Portfolio Balance not relevant for Founder; Partners/Requests lack context |
| Line Chart Card (Credit History) | `dashboard_screen.dart:121-129` | **Remove** | Historical data; not actionable for daily operations |
| Recent Activities | `dashboard_screen.dart:175-206` | **Replace** | Mock data; needs real project events |

### Items to Remove
- Score Card (Credit Points + Credibility Score)
- Line Chart Card (Credit History)
- Portfolio Balance stat card
- Investments Owned stat card (not Founder-relevant)
- Partners stat card (too vague)

### Items to Merge
- Requests Awaiting → Replaced by "Requires Your Attention" section

### Items to Replace
- 2x2 Stat Grid → Project Health Summary
- Recent Activities → Real Project Activity Timeline

---

## 2. New Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Welcome back,                                         │
│  Founder                                    [🔔] [⚙️]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─── REQUIRES YOUR ATTENTION ─────────────────────┐   │
│  │ ⚠️  3 Pending Participation Requests    [View →] │   │
│  │ ⚠️  2 Pending Conversation Requests     [View →] │   │
│  │ ⚠️  1 Offer awaiting response           [View →] │   │
│  │ 📄  Missing required documents           [View →] │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── PROJECT HEALTH ──────────────────────────────┐   │
│  │ Status: Active Funding                          │   │
│  │ ████████████░░░░ 65% Funded                     │   │
│  │ Raised: $130,000 / Target: $200,000             │   │
│  │ Remaining: $70,000 | Days Left: 18              │   │
│  │ Active Investors: 12 | Stage: Growth            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── FINANCIAL OBLIGATIONS ───────────────────────┐   │
│  │ 💰 Loan Repayment        $5,000   Due Jul 30  ⚡ │   │
│  │ 💰 Profit Distribution   $2,500   Due Aug 15  📅 │   │
│  │ 💰 Platform Fee          $500     Due Aug 01  📅 │   │
│  │ [View All Obligations →]                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── FUNDING & INVESTORS ─────────────────────────┐   │
│  │ Approved Investors: 12                          │   │
│  │ Pending Requests: 3 | Negotiations: 2           │   │
│  │ Active Conversations: 5                         │   │
│  │ Latest: Ahmed M. joined 2h ago                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── PROJECT EXECUTION ───────────────────────────┐   │
│  │ Milestones: 3/5 Complete                        │   │
│  │ Next: Beta Launch (Aug 10)                      │   │
│  │ Latest Update: "Q3 Progress" - 2d ago           │   │
│  │ Documents: 8 uploaded | Room: 12 messages       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── INVESTMENT MODEL SUMMARY ────────────────────┐   │
│  │ [Dynamic based on Investment Model]             │   │
│  │                                                 │   │
│  │ LOAN MODEL:                                     │   │
│  │ Outstanding: $150,000 | Repaid: $50,000         │   │
│  │ Next Repayment: $5,000 (Jul 30)                 │   │
│  │ Remaining Installments: 10                      │   │
│  │                                                 │   │
│  │ PROFIT SHARING MODEL:                           │   │
│  │ Share: 20% | Next Distribution: Aug 15          │   │
│  │ Eligible Investors: 12 | Cycle: Monthly         │   │
│  │                                                 │   │
│  │ EQUITY MODEL:                                   │   │
│  │ Issued: 1,000 shares | Remaining: 500           │   │
│  │ Shareholders: 8 | Ownership: 66.7% founder      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── RECENT ACTIVITY ─────────────────────────────┐   │
│  │ 10:30  Investor approved participation          │   │
│  │ 09:15  Document uploaded: Business Plan v2      │   │
│  │ Yesterday  Milestone completed: MVP Launch      │   │
│  │ [View Full Activity →]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── ANALYTICS ───────────────────────────────────┐   │
│  │ Public Views: 1,234 | Favorites: 89             │   │
│  │ Conversion: 3.2% | Engagement: High             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─── QUICK ACTIONS ───────────────────────────────┐   │
│  │ [New Investment] [Upload Document] [Send Update]│   │
│  │ [View Investors] [Manage Milestones]            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Required Backend Changes

### 3.1 New Endpoint: Founder Dashboard Summary (superseded by Phase 2)

> The historical proposal in this subsection is retained for context only. The authoritative implemented contract is in Section 6 below; it is portfolio-scoped and does not expose Opportunity Room operational details.

**Why:** The existing `GET /api/dashboard/summary` only returns credit/score data. We need a single endpoint that aggregates all Founder dashboard data to minimize API calls.

**Endpoint:** `GET /api/v1/founder/dashboard`

**Response DTO:**
```json
{
  "requiresAttention": {
    "pendingParticipationRequests": 3,
    "pendingConversationRequests": 2,
    "pendingNegotiations": 1,
    "offersAwaitingResponse": 1,
    "missingDocuments": 1,
    "overdueMilestones": 0,
    "upcomingDeadlines": []
  },
  "projectHealth": {
    "opportunityId": 123,
    "opportunityName": "GreenTech Co",
    "status": "ActiveFunding",
    "statusDisplay": "Active Funding",
    "stage": "Growth",
    "raisedAmount": 130000,
    "targetAmount": 200000,
    "remainingAmount": 70000,
    "fundingPercentage": 65.0,
    "daysRemaining": 18,
    "activeInvestors": 12
  },
  "financialObligations": [
    {
      "id": "ob-1",
      "type": "LoanRepayment",
      "description": "Monthly Loan Repayment",
      "amount": 5000,
      "dueDate": "2026-07-30",
      "status": "Upcoming",
      "priority": "High"
    }
  ],
  "fundingInvestors": {
    "approvedInvestors": 12,
    "pendingParticipationRequests": 3,
    "pendingNegotiations": 2,
    "activeConversations": 5,
    "latestInvestor": {
      "name": "Ahmed M.",
      "joinedAt": "2026-07-23T10:30:00Z"
    }
  },
  "projectExecution": {
    "milestoneProgress": "3/5",
    "milestonePercentage": 60,
    "nextMilestone": {
      "name": "Beta Launch",
      "dueDate": "2026-08-10"
    },
    "latestUpdate": {
      "title": "Q3 Progress",
      "publishedAt": "2026-07-21T14:00:00Z"
    },
    "documentsUploaded": 8,
    "projectRoomActivity": {
      "totalMessages": 12,
      "lastActivityAt": "2026-07-23T08:00:00Z"
    }
  },
  "investmentModel": {
    "type": "Loan",
    "loan": {
      "outstandingPrincipal": 150000,
      "totalRepaid": 50000,
      "remainingBalance": 100000,
      "nextRepayment": {
        "amount": 5000,
        "date": "2026-07-30"
      },
      "remainingInstallments": 10
    }
  },
  "recentActivity": [
    {
      "id": "act-1",
      "type": "InvestorApproved",
      "title": "Investor approved participation",
      "timestamp": "2026-07-23T10:30:00Z",
      "navigationTarget": "investment_requests"
    }
  ],
  "analytics": {
    "publicViews": 1234,
    "favorites": 89,
    "conversionRate": 3.2,
    "engagementLevel": "High"
  }
}
```

### 3.2 Reuse Existing APIs

| Dashboard Section | Existing API | Reuse? |
|---|---|---|
| Requires Attention | `GET /api/v1/opportunities/incoming-join-requests` | ✅ Yes |
| Requires Attention | `GET /api/v1/negotiations/conversation-requests` | ✅ Yes |
| Requires Attention | `GET /api/investment-requests` | ✅ Yes |
| Project Health | `GET /api/v1/opportunities/my` | ✅ Yes |
| Financial Obligations | `GET /api/v1/opportunities/investor-cash-flow/upcoming` | ✅ Yes |
| Funding & Investors | `GET /api/v1/opportunities/{id}/approved-investors` | ✅ Yes |
| Project Execution | `GET /api/v1/opportunities/{id}/events` | ✅ Yes |
| Project Execution | `GET /api/v1/opportunities/{id}/documents` | ✅ Yes |
| Project Execution | `GET /api/v1/opportunities/{id}/room` | ✅ Yes |
| Investment Model | `GET /api/v1/opportunities/my` (includes investmentType) | ✅ Yes |
| Analytics | `GET /api/v1/investments/analytics/summary` | ✅ Yes |

### 3.3 Backend Changes Required

1. **New Endpoint:** `GET /api/v1/founder/dashboard`
   - Aggregates data from multiple services into single response
   - Reduces frontend API calls from 8+ to 1
   - Caches response for 30 seconds to reduce load

2. **New DTO:** `FounderDashboardDto`
   - Combines data from existing DTOs
   - Adds computed fields (daysRemaining, fundingPercentage)

3. **No changes to existing endpoints** - all data is already available

---

## 4. Required Frontend Changes

### 4.1 Files to Modify

| File | Change | Priority |
|---|---|---|
| `lib/screens/dashboard_screen.dart` | Complete rewrite | High |
| `lib/services/dashboard_service.dart` | Add `fetchFounderDashboard()` method | High |
| `lib/services/mock_data.dart` | Update `DashboardData` model | High |
| `assets/lang/en.json` | Add new translation keys | High |
| `assets/lang/ar.json` | Add new translation keys | High |

### 4.2 New Components to Create

| Component | Purpose | Location |
|---|---|---|
| `AttentionCard` | Action items requiring Founder response | `lib/widgets/dashboard/attention_card.dart` |
| `ProjectHealthCard` | Project status summary | `lib/widgets/dashboard/project_health_card.dart` |
| `FinancialObligationsCard` | Upcoming financial items | `lib/widgets/dashboard/financial_obligations_card.dart` |
| `FundingInvestorsCard` | Investor summary | `lib/widgets/dashboard/funding_investors_card.dart` |
| `ProjectExecutionCard` | Execution progress | `lib/widgets/dashboard/project_execution_card.dart` |
| `InvestmentModelCard` | Dynamic model display | `lib/widgets/dashboard/investment_model_card.dart` |
| `ActivityTimeline` | Recent project events | `lib/widgets/dashboard/activity_timeline.dart` |
| `AnalyticsSummary` | Key metrics | `lib/widgets/dashboard/analytics_summary.dart` |
| `QuickActionsBar` | Action buttons | `lib/widgets/dashboard/quick_actions_bar.dart` |

### 4.3 New Translation Keys (EN)

```json
{
  "requires_your_attention": "Requires Your Attention",
  "pending_participation_requests": "Pending Participation Requests",
  "pending_conversation_requests": "Pending Conversation Requests",
  "pending_negotiations": "Pending Negotiations",
  "offers_awaiting_response": "Offers Awaiting Response",
  "missing_documents": "Missing Required Documents",
  "overdue_milestones": "Overdue Milestones",
  "project_health": "Project Health",
  "opportunity_status": "Opportunity Status",
  "funding_progress": "Funding Progress",
  "raised_amount": "Raised Amount",
  "target_amount": "Target Amount",
  "remaining_amount": "Remaining Amount",
  "days_remaining": "Days Remaining",
  "active_investors": "Active Investors",
  "project_stage": "Project Stage",
  "financial_obligations": "Financial Obligations",
  "upcoming_loan_repayment": "Upcoming Loan Repayment",
  "upcoming_profit_distribution": "Upcoming Profit Distribution",
  "upcoming_dividend_distribution": "Upcoming Dividend Distribution",
  "upcoming_capital_return": "Upcoming Capital Return",
  "platform_fees": "Platform Fees",
  "scheduled_payments": "Scheduled Payments",
  "overdue_payments": "Overdue Payments",
  "due_date": "Due Date",
  "no_obligations": "No upcoming financial obligations",
  "funding_investors": "Funding & Investors",
  "approved_investors": "Approved Investors",
  "pending_requests": "Pending Requests",
  "active_conversations": "Active Conversations",
  "latest_investor_joined": "Latest Investor Joined",
  "project_execution": "Project Execution",
  "milestone_progress": "Milestone Progress",
  "next_milestone": "Next Milestone",
  "latest_published_update": "Latest Published Update",
  "documents_uploaded": "Documents Uploaded",
  "project_room_activity": "Project Room Activity",
  "investment_model_summary": "Investment Model Summary",
  "outstanding_principal": "Outstanding Principal",
  "total_repaid": "Total Repaid",
  "remaining_balance": "Remaining Balance",
  "next_repayment": "Next Repayment",
  "remaining_installments": "Remaining Installments",
  "profit_share_percentage": "Profit Share Percentage",
  "next_distribution": "Next Distribution",
  "investors_eligible": "Investors Eligible",
  "distribution_frequency": "Distribution Frequency",
  "current_distribution_cycle": "Current Distribution Cycle",
  "issued_shares": "Issued Shares",
  "remaining_shares": "Remaining Shares",
  "current_shareholders": "Current Shareholders",
  "ownership_distribution": "Ownership Distribution",
  "recent_activity": "Recent Activity",
  "analytics": "Analytics",
  "public_views": "Public Views",
  "favorites": "Favorites",
  "conversion_rate": "Conversion Rate",
  "engagement": "Engagement",
  "quick_actions": "Quick Actions",
  "new_investment": "New Investment",
  "upload_document": "Upload Document",
  "send_update": "Send Update",
  "view_investors": "View Investors",
  "manage_milestones": "Manage Milestones",
  "view_all": "View All",
  "view_details": "View Details"
}
```

### 4.4 New Translation Keys (AR)

```json
{
  "requires_your_attention": "يتطلب انتباهك",
  "pending_participation_requests": "طلبات مشاركة معلقة",
  "pending_conversation_requests": "طلبات محادثة معلقة",
  "pending_negotiations": "مفاوضات معلقة",
  "offers_awaiting_response": "عروض تنتظر الرد",
  "missing_documents": "وثائق مطلوبة مفقودة",
  "overdue_milestones": "مراحل متأخرة",
  "project_health": "صحة المشروع",
  "opportunity_status": "حالة الفرصة",
  "funding_progress": "تقدم التمويل",
  "raised_amount": "المبلغ الم募集",
  "target_amount": "المبلغ المستهدف",
  "remaining_amount": "المبلغ المتبقي",
  "days_remaining": "الأيام المتبقية",
  "active_investors": "المستثمرون النشطون",
  "project_stage": "مرحلة المشروع",
  "financial_obligations": "الالتزامات المالية",
  "upcoming_loan_repayment": "سداد قرض قادم",
  "upcoming_profit_distribution": "توزيع أرباح قادم",
  "upcoming_dividend_distribution": "توزيع أرباح أسهم قادم",
  "upcoming_capital_return": "إعادة رأس المال قادمة",
  "platform_fees": "رسوم المنصة",
  "scheduled_payments": "مدفوعات مجدولة",
  "overdue_payments": "مدفوعات متأخرة",
  "due_date": "تاريخ الاستحقاق",
  "no_obligations": "لا توجد التزامات مالية قادمة",
  "funding_investors": "التمويل والمستثمرون",
  "approved_investors": "المستثمرون المعتمدون",
  "pending_requests": "الطلبات المعلقة",
  "active_conversations": "المحادثات النشطة",
  "latest_investor_joined": "آخر مستثمر انضم",
  "project_execution": "تنفيذ المشروع",
  "milestone_progress": "تقدم المراحل",
  "next_milestone": "المرحلة القادمة",
  "latest_published_update": "آخر تحديث منشور",
  "documents_uploaded": "الوثائق المرفوعة",
  "project_room_activity": "نشاط غرفة المشروع",
  "investment_model_summary": "ملخص النموذج الاستثماري",
  "outstanding_principal": "الرأس المال المستحق",
  "total_repaid": "إجمالي المدفوع",
  "remaining_balance": "الرصيد المتبقي",
  "next_repayment": "السداد التالي",
  "remaining_installments": "الأقساط المتبقية",
  "profit_share_percentage": "نسبة حصة الأرباح",
  "next_distribution": "التوزيع التالي",
  "investors_eligible": "المستثمرون المؤهلون",
  "distribution_frequency": "تكرار التوزيع",
  "current_distribution_cycle": "دورة التوزيع الحالية",
  "issued_shares": "الأسهم الصادرة",
  "remaining_shares": "الأسهم المتبقية",
  "current_shareholders": "المساهمون الحاليون",
  "ownership_distribution": "توزيع الملكية",
  "recent_activity": "النشاط الأخير",
  "analytics": "التحليلات",
  "public_views": "المشاهدات العامة",
  "favorites": "المفضلة",
  "conversion_rate": "معدل التحويل",
  "engagement": "التفاعل",
  "quick_actions": "إجراءات سريعة",
  "new_investment": "استثمار جديد",
  "upload_document": "رفع وثيقة",
  "send_update": "إرسال تحديث",
  "view_investors": "عرض المستثمرين",
  "manage_milestones": "إدارة المراحل",
  "view_all": "عرض الكل",
  "view_details": "عرض التفاصيل"
}
```

---

## 5. Phase 1 — Authoritative Portfolio Metric Contract

This section defines the data contract for the planned `GET /api/v1/founder/dashboard` endpoint. It is a read-model contract only. It does not introduce a second dashboard API, move domain ownership, or authorize the frontend to aggregate multiple Projects or Opportunities.

### 5.1 Scope and ownership

- The endpoint is scoped to the authenticated Founder. Every Project is selected by `Project.FounderId`; every child Opportunity must also belong to that Project/founder relationship.
- Project identity is authoritative at `Project.Id`.
- Opportunity identity is authoritative at `Opportunity.Id`.
- Participation identity is authoritative at `OpportunityJoinRequest.Id`.
- Investor identity is authoritative at `OpportunityJoinRequest.InvestorId`.
- All current values are calculated as of the request's UTC evaluation time. The endpoint must return the portfolio display currency used for normalized totals.
- The endpoint owns aggregation. The frontend consumes the returned totals, series, and scoped summaries and must not merge public Opportunity lists, load every Opportunity to calculate totals, or deduplicate investors locally.

### 5.2 Metric definitions

| Metric | Authoritative source | Definition and formula |
|---|---|---|
| Total Projects | `Project` | `COUNT(DISTINCT Project.Id)` for all founder-owned Projects. Archived Projects remain included because this is an ownership count, not an active-work count. Missing/deleted records are not counted. |
| Active Opportunities | `Opportunity`, existing effective funding/lifecycle resolver | `COUNT(DISTINCT Opportunity.Id)` where the existing effective funding state is currently `Open`, the opening/closing date rules pass at the UTC evaluation time, the Opportunity is not Archived or Completed, and its parent Project is not Archived. The endpoint must reuse the existing lifecycle predicate rather than introduce a new status mapping. |
| Active Investors | Approved investment Participation records | `COUNT(DISTINCT InvestorId)` across founder-owned Opportunities where `RequestType = InvestmentParticipation` and `Status = Approved`. A user is counted once across all Opportunities and repeat Participations. Pending, rejected, cancelled, general/conversation requests, and the founder are excluded. |
| Total Funding Target | `Opportunity.FundingTarget`, `Opportunity.FundingCurrency`, `Project.DefaultCurrency`, existing FX services | Sum each qualifying Opportunity target after display conversion into the portfolio display currency. The source amount is never mutated. Project-level and Opportunity-level currencies remain authoritative for their records. |
| Total Funded | Approved investment Participation records | Sum the approved/funded amount of each distinct approved investment Participation. Use the official `FundingAmount` and `FundingCurrency` when present; use the existing compatibility fallback only for legacy approved records that lack `FundingAmount`, and mark that fallback as approximate. Do not use payment transactions, expected returns, requested-but-unapproved amounts, or favorites. |
| Funding Progress | Total Funded and Total Funding Target | `TotalFunded / TotalFundingTarget * 100`. If the target is zero, return `0` and an empty/indeterminate progress state; never return `NaN` or infinity. Presentation may cap the visual bar at 100%, but the raw metric must not silently hide overfunding. |
| Received Amount | `PaymentTransaction`, linked through `ParticipationRequest` to `Opportunity` and `Project` | Sum `PaymentTransaction.Amount` for founder-owned Opportunities where the transaction is not reversed and is recorded by the current payment workflow. This is the platform-recorded confirmed amount, not an expected schedule amount and not an approved Participation amount. Reversed transactions are excluded from the current total. |
| Earnings | Realized profit/return records, if/when available | Sum only realized, non-reversed amounts classified as profit, interest, distribution, or return. Principal/funding received is excluded. Expected interest, expected profit, contract terms, and projected cash flow are not earnings. Current domain data does not yet expose a single authoritative realized-earnings classification, so the endpoint must not infer Earnings from `ReceivedAmount`. |
| Pending Actions | Founder-authorized actionable workflow records | Count distinct pending action items across participation approval, active negotiation response, moderation/approval work assigned to the founder, obligation confirmation, and other workflows only when the current founder is the authorized actor and the action is currently available. The identity is `(entity type, entity id, action code)`; one entity with multiple buttons is counted once per actionable action. Passive pending records, expired items, archived records, completed items, investor-owned actions, and admin-only actions are excluded. |
| Followers | Deferred | No metric is emitted from Favorites. No follower count is currently authoritative because there is no implemented follower entity/workflow for this contract. |

### 5.3 Amount and participation rules

- Approved funding is based on `OpportunityJoinRequest` rows with `RequestType = InvestmentParticipation` and `Status = Approved`.
- Repeat approved Participations are separate funding records and are each included in `TotalFunded`; they do not create additional Projects or Opportunities.
- `ActiveInvestors` is distinct by `InvestorId`, not by request, Opportunity, Project, contract, or payment.
- An approval with no valid positive official amount is not silently converted into funding. It is an unresolved data-quality item and must be surfaced in endpoint diagnostics or excluded from the amount while remaining eligible for the investor count only if the Participation is otherwise valid.
- Requested, entered, calculated, or negotiated amounts are not funded amounts until the Participation is approved. The compatibility fallback must not become a new amount precedence rule for new records.
- Payment transactions do not increase `TotalFunded`; they affect `ReceivedAmount` only.
- A reversed payment contributes neither to current `ReceivedAmount` nor to current Earnings.
- Obligation confirmations do not represent money received and do not increase either funding or received totals.

### 5.4 Status filters

- `TotalProjects`: all founder-owned Project statuses, including Draft, Active, Paused, Completed, and Archived.
- `ActiveOpportunities`: the existing effective funding status must be Open at evaluation time. Scheduled Opportunities that have not opened, Paused/Closed Opportunities, Draft/UnderReview/Rejected Opportunities, Completed/Archived Opportunities, and Opportunities under Archived Projects are excluded.
- `ActiveInvestors` and `TotalFunded`: only approved `InvestmentParticipation` requests on founder-owned Opportunities. Rejected and Cancelled requests are excluded. If a later lifecycle introduces an explicit exited/voided state, it must be excluded from Active Investors and defined separately for historical funding reporting.
- `ReceivedAmount`: only non-reversed recorded PaymentTransactions linked to the founder's Opportunities. A separate verification status is not currently present.
- `PendingActions`: only records whose current workflow state exposes an actionable founder operation. “Pending” alone is insufficient when the founder cannot act.

### 5.5 Currency normalization

- The portfolio response must declare one `displayCurrency`. Until a dedicated portfolio preference exists, resolve it using the existing currency architecture: the founder's active preferred currency, otherwise `CurrencyMasterDefaults.DefaultCurrency`.
- `TotalFundingTarget`, `TotalFunded`, `ReceivedAmount`, and any future realized Earnings total are converted for display into `displayCurrency` using the existing `ICurrencyConversionService` / currency master rules.
- `FundingTarget` is read from `Opportunity.FundingTarget` in `Opportunity.FundingCurrency`. Approved Participation amounts use their official `FundingCurrency`; recorded payments use the currency established by their linked Participation/payment workflow.
- Stored source amounts, funding currencies, and execution-time `ExchangeRateSnapshot` records are never rewritten or repriced as a ledger operation. Portfolio conversion is a reporting/display conversion.
- Where a stored execution snapshot is authoritative for the transaction, use it for the displayed historical amount when the existing service provides that behavior. Where only current display FX is available, the result is approximate and must be labeled as such.
- Per-Project summaries may retain `Project.DefaultCurrency`; portfolio totals must still be normalized to the single declared `displayCurrency` before summing.
- Conversion failure must not silently sum unlike currencies. The endpoint should return an unavailable/approximate indicator for the affected aggregate and preserve the source amount/currency for diagnostics.

### 5.6 Date and time-series rules

- All evaluation, filtering, and bucketing use UTC. The response may include localized presentation labels, but bucket boundaries are not client-local time boundaries.
- Current KPI values are point-in-time values at `evaluatedAt`.
- Monthly series use half-open UTC intervals `[monthStart, nextMonthStart)`, include zero-value buckets, and return a stable ascending order.
- Approved-funding series use the approval event timestamp: `ReviewedAt` when present, otherwise the existing compatibility `UpdatedAt` fallback. They represent newly approved funding, not payment cash flow.
- Received series use `PaymentTransaction.PaymentDate`. A reversal is represented as a negative adjustment at `ReversedAt` when available so cumulative net received reconciles to the current non-reversed total.
- Realized Earnings series use the realized transaction/event timestamp once an authoritative earnings source exists. Expected schedule dates and contract creation dates are excluded.
- A historical Active Opportunities series requires authoritative lifecycle transition timestamps. Current `Opportunity` state alone is sufficient for the current KPI but insufficient for accurate retrospective active-state charts; the endpoint must return no misleading historical series until those events are available.
- Event amounts are converted to `displayCurrency` using stored execution FX where available, otherwise the existing display conversion and an approximation marker.
- Date range, bucket size, and timezone parameters must be interpreted by the backend. The frontend must not reconstruct portfolio series from individual Opportunity responses.

### 5.7 Zero, empty, and unavailable behavior

- Empty founder portfolio: all count metrics are `0`; amount metrics are `0` in the declared display currency; series are returned with zero buckets when a date range is requested.
- No active Opportunities: `ActiveOpportunities = 0`, `FundingProgress = 0`, and no active-opportunity chart points beyond requested zero buckets.
- No approved Participations: `ActiveInvestors = 0`, `TotalFunded = 0`, and no funded series values.
- No recorded payments: `ReceivedAmount = 0`.
- No realized earnings: `Earnings = 0` with an explicit `not_started`/empty state, provided the metric source is available and there are simply no qualifying records.
- Missing or unsupported earnings source, missing payment currency, or failed FX conversion is not the same as a legitimate zero. Return a metric availability/approximation state so the UI does not present an unknown value as zero.
- `Followers` remains deferred and must be represented as unavailable/deferred, not zero derived from Favorites.
- No metric may use mock, synthetic, or frontend-derived fallback values.

### 5.8 Authoritative-source matrix and exclusions

| Portfolio concern | Authoritative current entities | Explicit exclusions |
|---|---|---|
| Ownership and hierarchy | `Project`, `Opportunity` | Public Opportunity discovery results, Favorites, frontend list merges |
| Funding commitments | `OpportunityJoinRequest`, `ExchangeRateSnapshot` | Pending requests, general participation, requested amounts, payment rows |
| Investor distinctness | `OpportunityJoinRequest.InvestorId` | Request count, contract count, payment count, display name |
| Cash received | `PaymentTransaction`, `PaymentAllocation`, linked Participation/Opportunity | Expected schedules, approved commitments, reversed transactions, obligation confirmations |
| Earnings | A future/validated realized return or profit transaction source | Contract projections, expected interest, principal, total received |
| Pending work | Existing request, negotiation, approval, obligation workflow state and actionability | Passive notifications, expired/completed work, actions for another actor |
| Followers | No current authoritative entity | `InvestmentFavorite` / Opportunity Favorites |
| FX and display currency | `Project.DefaultCurrency`, founder currency preference, currency master, `ICurrencyConversionService`, `ExchangeRateSnapshot` | Hardcoded symbols, client-side rates, summing raw unlike-currency amounts |

### 5.9 Unresolved gaps before implementation

1. The current domain has no verified payment status or external settlement proof. A non-reversed `PaymentTransaction` is the closest current source for `ReceivedAmount`, but it represents a platform-recorded payment declaration and must not be described as independently bank-confirmed.
2. The current domain does not provide one realized earnings ledger that separates principal from interest/profit/distributions across Loan, Equity, and Profit Sharing models. `Earnings` must remain explicitly unavailable or zero-with-empty-state until that source is defined.
3. The current domain has no follower model. Favorites remain investor-specific saves and are not a substitute.
4. Historical lifecycle transition timestamps are incomplete for accurate Active Opportunity time series.
5. Legacy approved Participations may lack `FundingAmount` or a complete currency snapshot. Compatibility fallback and approximation reporting must be tested before relying on portfolio totals.
6. Pending Actions require a single backend actionability projection across request, negotiation, approval, and obligation workflows. Raw status counts are not sufficient.

## 6. Phase 2 — Implemented Founder Portfolio Read Model

`GET /api/v1/founder/dashboard` is now the single authenticated Founder portfolio read model. It returns the standard API response envelope and a `FounderDashboardDto` containing:

- `evaluatedAtUtc`, `displayCurrency`, `metrics`, `projects`, `timeSeries`, and `availability`.
- Portfolio metrics for Projects, active Opportunities, distinct approved investors, normalized target/funded/received amounts, progress, and currently authoritative pending actions.
- Nullable/availability-aware money values (`value`, `available`, `approximate`, `unavailableReason`) so unsupported metrics are not represented as invented zeroes.
- Lightweight Project summaries with child Opportunity summaries only; no Room entries, Room documents, negotiation detail, payment detail, or public-page payloads.
- Monthly UTC `fundingApprovals`, `receivedAmounts`, and empty `earnings` series. Optional `fromUtc` and `toUtc` query parameters control zero-filled monthly buckets; the backend owns bucketing and FX conversion.

The implementation uses owner-scoped, no-tracking repository queries for Projects, Opportunities, approved Participation rows, PaymentTransactions, and pending workflow records. It performs FX conversion server-side and caches each currency pair for the request. Existing Project, Opportunity, Public Opportunity, Opportunity Room, and legacy analytics APIs are unchanged.

Confirmed limitations:

1. `Earnings` is explicitly unavailable because the current domain has no authoritative realized-return ledger.
2. Followers are explicitly deferred and are never derived from Favorites.
3. `ReceivedAmount` is platform-recorded from non-reversed `PaymentTransaction` rows and is not independently bank-confirmed by the current domain.
4. Legacy approved Participations without `FundingAmount` use the existing compatibility amount fallback and are marked approximate.
5. Historical active-Opportunity series is not emitted because lifecycle transition history is incomplete.
6. The current pending-action projection covers pending founder-visible investment approvals, founder obligation confirmations, incoming conversation requests, and pending negotiation offers addressed to the founder; other workflows remain excluded until they expose authoritative founder actionability.

## 7. Remaining Implementation Plan

### Phase 1: Backend (Day 1-2)

| Task | Owner | Duration | Dependencies |
|---|---|---|---|
| Founder Dashboard DTO/read model | Completed | Backend | Phase 2 |
| `GET /api/v1/founder/dashboard` endpoint | Completed | Backend | Phase 2 |
| Focused aggregation tests | Completed | Backend | Phase 2 |
| Frontend integration | Deferred | Frontend | Product/UI phase |

### Phase 2: Frontend Models (Day 2-3)

| Task | Owner | Duration | Dependencies |
|---|---|---|---|
| Create `FounderDashboard` model | Frontend | 2h | Backend DTO |
| Update `DashboardService` with new endpoint | Frontend | 2h | Model |
| Add translation keys (EN + AR) | Frontend | 1h | None |
| Remove old mock data dependencies | Frontend | 1h | None |

### Phase 3: Frontend Components (Day 3-5)

| Task | Owner | Duration | Dependencies |
|---|---|---|---|
| Create `AttentionCard` widget | Frontend | 3h | Model |
| Create `ProjectHealthCard` widget | Frontend | 3h | Model |
| Create `FinancialObligationsCard` widget | Frontend | 3h | Model |
| Create `FundingInvestorsCard` widget | Frontend | 2h | Model |
| Create `ProjectExecutionCard` widget | Frontend | 3h | Model |
| Create `InvestmentModelCard` widget | Frontend | 4h | Model |
| Create `ActivityTimeline` widget | Frontend | 2h | Model |
| Create `AnalyticsSummary` widget | Frontend | 2h | Model |
| Create `QuickActionsBar` widget | Frontend | 2h | None |

### Phase 4: Dashboard Integration (Day 5-6)

| Task | Owner | Duration | Dependencies |
|---|---|---|---|
| Rewrite `DashboardScreen` | Frontend | 4h | All widgets |
| Wire up API calls | Frontend | 2h | Service |
| Add pull-to-refresh | Frontend | 1h | Screen |
| Add error handling | Frontend | 2h | Screen |
| Add loading states | Frontend | 1h | Screen |

### Phase 5: Polish & Testing (Day 6-7)

| Task | Owner | Duration | Dependencies |
|---|---|---|---|
| RTL support verification | Frontend | 2h | Screen |
| Dark mode verification | Frontend | 2h | Screen |
| Responsive layout testing | Frontend | 2h | Screen |
| Navigation integration | Frontend | 2h | Screen |
| Performance optimization | Frontend | 2h | Screen |

---

## 6. Acceptance Criteria

### Must Have
- [ ] "Requires Your Attention" section shows only actionable items
- [ ] Each attention item navigates to relevant screen
- [ ] Project Health shows accurate funding data
- [ ] Financial Obligations shows upcoming items with amounts and dates
- [ ] Investment Model renders dynamically based on type
- [ ] All sections support EN/AR
- [ ] All sections support RTL
- [ ] All sections support Light/Dark mode
- [ ] No duplicate information across sections
- [ ] Single API call loads all dashboard data

### Should Have
- [ ] Pull-to-refresh updates all sections
- [ ] Empty states for each section
- [ ] Smooth animations on load
- [ ] Accessibility labels for screen readers

### Won't Have (This Release)
- [ ] Real-time updates via SignalR
- [ ] Push notification integration
- [ ] Offline support

---

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| Backend endpoint delays | High | Use existing endpoints as fallback |
| Translation completeness | Medium | Create comprehensive key list upfront |
| RTL layout issues | Medium | Test early with Arabic content |
| Performance with large datasets | Low | Implement pagination in backend |

---

## 8. Success Metrics

- **API Calls:** Reduced from 8+ to 1 for dashboard load
- **Time to Action:** Founder sees actionable items within 2 seconds
- **Information Density:** 9 sections in single scrollable view
- **Zero Placeholders:** All data from authoritative backend sources
