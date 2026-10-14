# Ready-to-Proceed and Console Defect Report

Date: 2026-09-09

## Ready-to-Proceed 400

The server lifecycle rule is intentional: `MarkReadyToProceedAsync` accepts only `Accepted` or `Negotiation` conversations. A conversation that is already `ReadyForParticipation` must be rejected and must not be mutated.

The proven client defect was state ambiguity. `NegotiationConversationDto` exposed `FounderReady` and `InvestorReady` but not the readiness value for the authenticated viewer. The Angular mapper inferred `currentUserReady` from direction/local storage. When that inference was missing or stale, the Ready button remained available after the conversation had reached `ReadyForParticipation`, and the client posted `{}` again. The backend then returned HTTP 400 with `INVALID_CONVERSATION_STATUS` and the message `Only active negotiation conversations can be marked ready.`

Fixes:

- Added authoritative `CurrentUserReady` to the conversation DTO and populated it from the authenticated viewer in `NegotiationService`.
- Restricted the Ready action and its method guard to `Founder Accepted` and `Negotiation in Progress`.
- Preserved the backend lifecycle validation.
- Included the business error code in negotiation error envelopes so the client can localize known business failures.
- Added EN/AR messages for invalid state, not found, and authorization failures.

Focused unit coverage: 14 negotiation journey tests passed, including valid founder readiness, invalid lifecycle rejection, and viewer-specific readiness.

Live API evidence (disposable sessions, 2026-09-09):

- Founder `POST /api/v1/conversations/cc663ffd-4379-4133-90e3-f64728eecceb/ready-to-proceed` returned `200`; response showed `FounderReady=true`, `InvestorReady=false`, `CurrentUserReady=true`.
- Investor `POST` on the same conversation returned `200`; response and subsequent GET showed `conversationStatus=ReadyForParticipation`, `FounderReady=true`, `InvestorReady=true`, and `CurrentUserReady=true` for the Investor.
- Founder and Investor refresh GETs both returned `200` with the same final authoritative state.
- Founder duplicate POST returned `400` with `data.code=INVALID_CONVERSATION_STATUS`; a follow-up GET confirmed no state mutation.
- Unrelated authenticated Client GET and POST both returned `403` with `data.code=CONVERSATION_FORBIDDEN`.
- Authenticated OrgUser/Admin negotiation access returned `401` with `data.code=CLIENT_REQUIRED`; anonymous GET returned `401`.
- `/health` returned `200 Healthy`.

## Logo and image defects

- Removed the runtime seed avatar fallback to `ui-avatars.com` (`AvatarUrl = null`).
- Investment preview now rejects demo hosts (`logoexample.com`, `example.com`, and `ui-avatars.com`) and uses the local `/assets/project-placeholder.svg` asset.
- Replaced the malformed base64 SVG placeholder in Investments with the same valid local SVG asset.
- Removed the `Opportunity loaded ... isFounder` debug log.
- Profile-picture lookup now treats only HTTP 404 as no image (`null`); 5xx/network errors still propagate to the caller's existing diagnostic path without retry.
- `flag-icons` is not present locally. The existing jsDelivr stylesheet remains a browser-only tracking-prevention warning; no new CDN was added.

## Verification

- Browser Founder flow: PASS. The new disposable conversation displayed `Founder Not ready / Investor Not ready / Your state Not ready` with a Ready button; after the confirmation, the UI showed `Founder Ready / Investor Not ready / Your state Ready`.
- Browser Investor flow: PASS. The same conversation showed the authoritative Founder-ready state, the Investor Ready action succeeded, and the UI changed to `Ready for participation` with both parties ready and no Ready button. Browser refresh preserved that state.
- Browser console: no application-source errors on the chat, preview, or profile flows.
- Investment preview rendered `http://localhost:3000/assets/project-placeholder.svg`; no `logoexample.com` request or malformed SVG error was observed.
- Profile with no picture rendered the local initials fallback (`LF`) with no console error.
- Source hygiene: `investments.component.js` was stale/generated and absent from the Angular TS build (`allowJs=false`); it was removed. `project-placeholder.svg` is present.
- Backend Release build: PASS (isolated writable output; 0 errors; existing dependency/nullability warnings remain). The repository's pre-existing API `obj` cache is ACL-blocked, so the verification build used an isolated output directory.
- Client production build: PASS.
- i18n validation: PASS.
- Focused backend negotiation tests: PASS (14/14).
- Client headless tests: BLOCKED because Chrome is not installed at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- `git diff --check`: PASS.
- Existing flag-icons jsDelivr tracking-prevention notice remains browser-only; no new CDN was added.

## Files changed by this task

- `Core-BackEnd/Investa.Application/DTOs/NegotiationDtos.cs`
- `Core-BackEnd/Investa.Application/Services/NegotiationService.cs`
- `Core-BackEnd/Investa.API/Controllers/NegotiationsController.cs`
- `Core-BackEnd/Investa.Tests/Investa.UnitTests/NegotiationJourneyTests.cs`
- `investa-client-portal/src/app/pages/admin/chat/chat.component.ts`
- `investa-client-portal/src/app/services/file-store.service.ts`
- `investa-client-portal/src/app/pages/admin/investment-preview/investment-preview.component.ts`
- `investa-client-portal/src/app/pages/admin/investments/investments.component.ts`
- `investa-client-portal/src/app/pages/admin/investments/investments.component.js` (removed as stale/generated duplicate)
- `investa-client-portal/src/assets/project-placeholder.svg`
- `investa-client-portal/src/assets/i18n/en.json`
- `investa-client-portal/src/assets/i18n/ar.json`

## Final classification

READY-TO-PROCEED — LIVE VERIFIED / CLOSED
