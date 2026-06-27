# Profile V2 Restoration — Implementation Plan

## Scope
Frontend-only changes (no new backend endpoints/DB fields/DTOs).

## Modified files (to be updated)
1) `investa-client-portal/src/app/pages/admin/profile/profile.component.ts`
2) `investa-client-portal/src/app/pages/admin/profile/profile.component.html`
3) `investa-client-portal/src/app/pages/admin/profile/profile.component.scss` (optional minimal styling)

## Implementation checklist
- [ ] Update profile tab model to: Personal Information, Investment Profile, Personalization, Notifications, Security, Credit Management, Score
- [ ] Remove forbidden UI sections: Communication, Trust/Verification, KYC/Identity Compliance widgets
- [ ] Sidebar cleanup: keep Avatar, Name, Score, Credit Balance, Navigation only
- [ ] Personal Information tab: show Profile Picture, First Name, Last Name, Email, Phone, Country, City, LinkedIn, Bio (merge old Details+Communication; no duplicates)
- [ ] Personalization tab: Theme (System/Dark/Light) + Language (Arabic/English) with persisted settings (reuse existing Theme/Language services/implementations if present)
- [ ] Investment Profile tab: risk + experience + Preferred Categories multi-select loaded dynamically from existing Categories source
- [ ] Notifications tab: required toggles for Email notifications + Push enabled/disabled + Marketing enabled/disabled
- [ ] Security tab: Change Password + Active Sessions + Last Login + Device Information (no 2FA)
- [ ] Credit Management tab: Current balance + credits purchased/consumed + Credit transactions table
- [ ] Score tab: Current Score (BasicInfoDto.Score from GET /api/profile/me) + Score transactions if available; no levels/rankings/recommendations
- [ ] Scroll-to-top when entering profile page

## Verification requirements before build
- Provide modified file list.
- After build: build status, TypeScript error count, warnings count.

