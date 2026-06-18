# TODO - Investa (Implementation Only)

## Plan Steps
1. Confirm backend DTO/request payload fields for `CreateInvestmentRequestDto` (requestType + requestMetadata + amount/shares semantics).
2. Update Angular `RequestsService.createInvestmentRequest(...)` to send:
   - `requestType` as enum value (no magic strings)
   - `requestMetadata` JSON (null for ContactFounder; structured for InvestmentInterest)
   - existing fields `investmentId`, `amount`, `shares` kept consistent with backend DTO.
3. Update Angular Investment Preview (investa-client-portal) to implement UX:
   - Contact Founder card: open Credit Confirmation dialog; then call RequestsService with requestType=ContactFounder and requestMetadata=null.
   - Invest Now card: equity dialog (share price, available shares, shares input, live total); then Credit Confirmation dialog; then call RequestsService with requestType=InvestmentInterest and requestMetadata payload.
4. Update Angular Requests page to render:
   - Request Type explicitly
   - For InvestmentInterest: metadata visually (Shares Requested, Share Price, Total Value)
   - No raw JSON.
5. Update Angular request model/interfaces to include `requestType` and `requestMetadata`.
6. Update Flutter Partner:
   - Contact Founder flow with credit confirmation + create request (requestType ContactFounder, requestMetadata null)
   - Invest Now (equity only) with equity form + total calc + credit confirmation + create request (requestType InvestmentInterest, structured requestMetadata)
7. Update Flutter Founder:
   - Requests list to render request type
   - For InvestmentInterest: render metadata visually
   - Approve/Reject call backend APIs.
8. Update Flutter request service payload parsing to include requestType + requestMetadata exactly matching Angular/Backend.
9. Run builds/tests:
   - `dotnet build` (Core-BackEnd)
   - `npm run build` (investa-client-portal)
   - `flutter build` (per your platform)
10. Critical path validation results + screenshots + known issues.

