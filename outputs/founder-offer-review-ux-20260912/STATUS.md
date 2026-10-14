# Founder Offer Review UX — Status

## Scope

Founder offer review was redesigned in the conversation offer card and the direct offer inbox. The implementation reuses the existing `OfferService`, `OfferBuilderComponent`, and server capability flags (`canAccept`, `canReject`, `canRespond`, `canWithdraw`).

## Completed

- Offer version, submitter and role, status, submitted date/time, total amount, leg count, and submitted terms are visible together.
- Conversation actions are grouped in a clear decision box: Accept (primary), Respond with new offer (secondary when `canRespond` is true), Reject (destructive), and Withdraw (creator-only when `canWithdraw` is true).
- Accept/reject/withdraw actions require localized confirmation and remain protected by existing pending/status/capability checks.
- Terminal offers show an explicit no-further-action state.
- Direct inbox actions remain limited to backend-supported accept/reject endpoints; no unsupported direct counter/withdraw action was introduced.
- EN/AR labels and accessibility labels were added for the new metadata and action regions.

## Verification

- Client production build: PASS.
- i18n validation: PASS.
- Negotiation and offer participation tests: 29 passed.
- `git diff --check`: PASS.
- Browser live verification: BLOCKED because the Computer Use helper was unavailable and ChromeHeadless is not installed at `C:\Program Files\Google\Chrome\Application\chrome.exe`.

## Remaining gap

Founder/Investor live acceptance, counter/replacement, refresh persistence, and role-isolation scenarios require an available browser session and running API/client environment. No backend lifecycle code was changed.

## Classification

FOUNDER OFFER REVIEW UX — IMPLEMENTED WITH GAPS

