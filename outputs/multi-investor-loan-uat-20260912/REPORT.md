# FOPX ONE — MULTI-INVESTOR LOAN END-TO-END UAT REPORT

**Run date:** 2026-09-12 (Africa/Cairo)  
**Scope:** disposable API/application UAT on the active `InvestaDb`; no EF migration was applied and no source code was changed for this run.

## A. Environment

| Check | Result |
|---|---|
| Database | `InvestaDb` (SQL Server `localhost`) |
| Database state | ONLINE; recovery model FULL |
| API | `http://127.0.0.1:5235`; `GET /health` = 200; `GET /api/health` = 200; Development |
| EF migration listing | `20260910115518_InitialCleanBaseline`; listing was read-only; applied/pending delta was not independently exposed by the API |
| Client/browser | Angular client was not listening on port 3000 during this run; browser UI verification is therefore unproven |
| Build checks | Backend Release build PASS; Client production build PASS; i18n PASS; `git diff --check` PASS |
| Tests | 19 focused Loan obligation/repayment/lifecycle unit tests PASS |

## B. Test users

| Role | UserId |
|---|---|
| Founder | `5cd285dc-5fcd-4dca-3bc7-08df10ee4136` |
| Investor A | `0527d7f7-32f8-4a62-3bc8-08df10ee4136` |
| Investor B | `74598dc6-21fc-474a-3bc9-08df10ee4136` |
| Investor C | `ff1ce7d7-ff3f-4100-3bca-08df10ee4136` |

All four logins were created/verified through the canonical registration/login API. Credentials are intentionally excluded.

## C. Created IDs

| Entity | IDs |
|---|---|
| Project | 5 |
| Opportunity | 5 |
| Offers / versions | A: 5/1; B: 6/1; C: 7/1 |
| OfferLegs | A: 5; B: 6; C: 7 |
| Participations | A: 8; B: 9; C: 10 |
| Contracts | A: 5; B: 6; C: 7 |
| FundingDeclarations | A: 3; B: 4; C: 5 |
| LoanObligations | A: 2; B: 3; C: 4 |
| RepaymentDeclarations | A: 5 and 9 confirmed, 8 disputed; B: 6 and 10 confirmed; C: 7 and 11 confirmed |

The direct `InvestmentParticipation` join-request endpoint returned controlled `400 OFFER_REQUIRED` for all three investors. The supported OfferLeg-native flow was then used: conversation request → founder accept → structured Loan offer → founder accept.

## D. Lifecycle matrix

| Investor | Offer accepted | Contract | Funding confirmed | Obligation | Schedule | Repayment | Final status | Outstanding |
|---|---:|---:|---:|---:|---:|---|---|---:|
| A | 5 / leg 5 | 5 | 100,000 EGP | 2 Active → FullyRepaid → Closed | 12 rows | 110,000 EGP confirmed across declarations 5 and 9 | Closed | 0 |
| B | 6 / leg 6 | 6 | 80,000 EGP | 3 Active → FullyRepaid → Closed | 6 rows | 84,800 EGP confirmed across declarations 6 and 10 | Closed | 0 |
| C | 7 / leg 7 | 7 | 120,000 EGP | 4 Active → FullyRepaid → Closed | 18 rows | 134,400 EGP confirmed across declarations 7 and 11 | Closed | 0 |

All contracts preserved the exact accepted Offer/version and Loan terms. SQL verification showed 3 independent obligations and 36 UAT schedule rows (the database also contained pre-existing obligation data).

## E. Financial reconciliation

| Investor | Principal | Contract interest | Total due | Confirmed repaid | Final outstanding |
|---|---:|---:|---:|---:|---:|
| A | 100,000 | 10,000 | 110,000 | 110,000 | 0 |
| B | 80,000 | 4,800 | 84,800 | 84,800 | 0 |
| C | 120,000 | 14,400 | 134,400 | 134,400 | 0 |

Funding reconciliation was 300,000 EGP committed, declared, and confirmed. No PaymentTransactions, PaymentAllocations, or WalletTransactions rows were present after the run (a pre-run baseline count was not captured, so an exact delta is not claimed).

## F. Repayment and authorization evidence

- Each repayment declaration was created through `POST /api/v1/loan-repayments/opportunities/5/obligations/{id}` and returned 201 PendingConfirmation.
- Each associated investor confirmation returned 200 Confirmed.
- FIFO allocation correctly paid monthly interest first and principal at maturity; all schedule rows became Paid.
- Duplicate confirmation of declaration 5 returned 200 with unchanged Confirmed state.
- Investor B confirming A’s declaration 5 returned 403 `LOAN_REPAYMENT_FORBIDDEN`.
- Overpayment confirmation (declaration 8, 200,000 EGP against A) returned 400 `LOAN_REPAYMENT_OVERPAYMENT`; the investor disputed that negative-path declaration, leaving no allocation.
- Zero and negative amounts returned 400 `INVALID_REQUEST`.
- Wrong currency returned 400 `LOAN_REPAYMENT_CURRENCY_MISMATCH`.
- Founder declaring against unrelated obligation 1 returned 403 `LOAN_REPAYMENT_FORBIDDEN`.
- A new repayment against closed obligation 2 returned 400 `LOAN_OBLIGATION_INACTIVE`.
- Unrelated Investor C reading Contract 5 returned 403; anonymous Contract/repayment access returned 401.
- Investor B attempting to access Investor A’s conversation/offer returned 403 `CONVERSATION_FORBIDDEN`.

Closure through the supported operator endpoint returned 200 for obligations 2, 3, and 4. Final SQL status for all three was Closed with zero final outstanding values.

## G. Dashboard / Room / notification verification

- Founder dashboard API returned 200 with project 5, opportunity 5, 3 active investors, and 300,000 EGP committed/declared/confirmed/funded.
- Investor A/B/C participation APIs returned only their own contract/participation rows, preserving private-data isolation.
- Project Room API returned 200 for Founder and each participating Investor; visibility counts were Founder 3 and each Investor 1.
- Funding, repayment, fully-repaid, and closed notifications were created for the expected parties; API notification lists showed the expected recipient-specific records and action URLs.
- Client UI rendering and browser console verification could not be performed because the Angular client was unavailable on port 3000.

## H. Gap register

| Gap | Severity | Module | Expected | Actual / evidence | Root cause | Recommended action | Status |
|---|---|---|---|---|---|---|---|
| G-001 | P1 | Opportunity Room / state projection | Room and opportunity state reflect the three closed obligations | Project Room still reported `obligationCompletionStatus: NotStarted`; opportunity detail reported `fundingStatus: NotScheduled` and `obligationCompletionStatus: NotStarted` after obligations 2–4 were Closed | Projection/completion integration is incomplete or not refreshed | Reconcile Room/opportunity projections from LoanObligation lifecycle state and add an end-to-end regression | Open |
| G-002 | P1 | Investor dashboard contract | Each investor sees own Loan principal, maturity, schedule, repayment totals, and closed status | `my-participations` returned own participation but `principal`, `finalRepaymentDate`, and contract dates were null; funding totals were 300,000 EGP aggregate for each investor | Investor participation DTO is not populated from LoanObligation/summary data and mixes opportunity totals with per-investor fields | Populate per-participation Loan summary and separate aggregate opportunity totals | Open |
| G-003 | P2 | Opportunity metadata | Loan offer terms are represented consistently at opportunity/portfolio level | Opportunity `investmentModel` remained `Unspecified` and core interest/repayment fields remained null while accepted OfferLegs were Loan-native | Architecture is OfferLeg-native, but summary DTO semantics are unclear | Make OfferLeg-derived summary explicit and label aggregate vs contractual fields | Open |
| G-004 | P1 | Repayment multipart API contract | Selecting installment IDs in the documented multipart shape returns a controlled response | A multipart request containing `InstallmentIdsJson` returned HTTP 500 InternalServerError; omitting the optional selector succeeded with FIFO allocation | Exact binding/runtime exception was not exposed by the API; root cause remains unproven | Align documented field binding and return a controlled 4xx for malformed/unsupported selector input; add API test | Open |
| G-005 | P2 | Frontend/runtime verification | Founder/investor dashboards, Room controls, and browser console are verified live | Client port 3000 was unavailable, so UI actions and console state are unproven | Environment availability | Run the same IDs through the Angular UI when the client is available | Open |
| G-006 | P2 | Founder dashboard | Repaid/closed Loan earnings and repayment widgets are visible where supported | Founder dashboard reported earnings unavailable: “realized earnings source is not implemented” | Explicit DTO capability gap | Implement or clearly label realized earnings/loan repayment widgets | Open |
| G-007 | P2 | Entry UX/API contract | Investor entry route clearly leads to the supported offer flow | Direct InvestmentParticipation join request was rejected 400 `OFFER_REQUIRED`; only the conversation → structured offer path worked | Offer-native business rule is enforced, but the alternate endpoint remains discoverable | Hide/deprecate the incompatible route in client UX and document the canonical path | Open |

No source fix was made during this UAT. The only mutations were disposable business entities and their canonical lifecycle records in the active `InvestaDb`.

## I. Overall result

The complete API lifecycle succeeded for all three investors: accepted offers, exact contracts, confirmed funding, separate active obligations, independent schedules, staged and full repayment, FIFO allocation, fully repaid transitions, operator closure, notifications, and targeted authorization/validation negatives. The run cannot be classified closed because Room and investor DTO projections remain inconsistent and the browser UI was unavailable.

**MULTI-INVESTOR LOAN LIFECYCLE — LIVE VERIFIED WITH GAPS**


