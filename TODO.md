# Project Dashboard Cleanup TODO

## 1. Post Update Removal
- [ ] Remove disabled Post Update button block from dashboard.component.html
- [ ] Remove `dashboard.postUpdate` and `dashboard.postUpdateUnavailable` from en.json
- [ ] Remove `dashboard.postUpdate` and `dashboard.postUpdateUnavailable` from ar.json

## 2. Slow Text Fix
- [ ] Fix LanguageService to preload translations via APP_INITIALIZER before bootstrap
- [ ] Add loading skeleton for dynamic data sections only (not static labels)
- [ ] Keep static UI labels rendering immediately

## 3. Backend - Approved Investors
- [ ] Create `ApprovedInvestorSummaryDto.cs`
- [ ] Add `GetApprovedInvestorsAsync` to `IOpportunityService`
- [ ] Implement in `OpportunityService` (join `OpportunityJoinRequest` + `AuthUser`, distinct, approved only)
- [ ] Add endpoint `GET /api/v1/opportunities/{id}/approved-investors` to `OpportunitiesController`

## 4. Frontend - Approved Investors
- [ ] Add `getApprovedInvestors()` method to `OpportunityService`
- [ ] Add approved investors logic to `DashboardComponent` (signal, loading, +N expansion)
- [ ] Replace participants-panel section HTML in dashboard.component.html with investors list
- [ ] Add `dashboard.investors.*` translation keys to en.json
- [ ] Add `dashboard.investors.*` translation keys to ar.json
- [ ] Verify keyboard accessibility and hover/focus states

## 5. Verification
- [ ] Backend build (`dotnet build`)
- [ ] Frontend build (`ng build`)
- [ ] Report findings

