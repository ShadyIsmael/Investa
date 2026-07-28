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

### 3.1 New Endpoint: Founder Dashboard Summary

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

## 5. Implementation Plan

### Phase 1: Backend (Day 1-2)

| Task | Owner | Duration | Dependencies |
|---|---|---|---|
| Create `FounderDashboardDto` | Backend | 2h | None |
| Implement `GET /api/v1/founder/dashboard` endpoint | Backend | 4h | DTO |
| Add caching layer (30s TTL) | Backend | 2h | Endpoint |
| Unit tests | Backend | 2h | Endpoint |
| API documentation | Backend | 1h | Tests |

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
