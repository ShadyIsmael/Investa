# Investment Type Flow Refactoring

## Overview
Refactored the new investment creation flow to support two distinct investment types with different fields and business logic:

### Investment Types

#### 1. **Founding Investment** (Type ID: 1)
- **Description**: Fixed duration investment with profit-based returns
- **Business Model**: Investors provide capital for a specific duration, receive profit share at specified frequency, and the deal concludes after the duration ends
- **Key Fields**:
  - `durationMonths`: Investment duration in months (required)
  - `profitPercentage`: Expected profit percentage (required)
  - `payoutFrequency`: How often profits are paid (Monthly, Quarterly, Semi-Annually, Annually, At Maturity) (required)
  - `expectedROI`: Expected return on investment percentage
- **Backend Defaults**: Uses `sharePrice = 1.0` and `totalShares = initialCapital` for compatibility

#### 2. **Equity Investment** (Type ID: 2)
- **Description**: Share-based investment with equity growth
- **Business Model**: Investors buy shares, value grows with company, long-term ownership
- **Key Fields**:
  - `sharePrice`: Price per share (required)
  - `totalShares`: Total shares available (required)
  - `valuationCap`: Company valuation cap (required)
  - `targetFund`: Auto-calculated as sharePrice × totalShares
- **Validation**: Enforces share-based pricing structure

### Common Fields (Both Types)
- `businessName`, `description`, `businessCategoryId`, `businessStageId`
- `initialCapital`, `currency`, `minInvestment`, `maxInvestment`
- `startDate`, `endDate`, `imageUrl`, `videoUrl`
- `projectPhaseId`, `milestone`, `riskLevel`, `expectedROI`

---

## Implementation Details

### Flutter Founder App
**File**: `Flutter_Founder/lib/screens/new_investment_screen.dart`

#### Changes Made:
1. **Added Founding-specific controllers**:
   ```dart
   final TextEditingController _durationMonthsController = TextEditingController();
   final TextEditingController _profitPercentageController = TextEditingController();
   final TextEditingController _payoutFrequencyController = TextEditingController();
   ```

2. **Moved investment type selection to Step 1** with explanatory text:
   ```dart
   // Type 1: Founding - Fixed duration with profit-based returns
   // Type 2: Equity - Share-based with equity growth
   ```

3. **Refactored Step 2 (Financials) with conditional rendering**:
   ```dart
   final isFoundingType = _investmentTypeId == 1;
   
   if (isFoundingType) {
     // Show: Duration, Profit %, Payout Frequency fields
   } else {
     // Show: Share Price, Total Shares, Valuation Cap fields
   }
   ```

4. **Updated validation in `_nextStep()`**:
   ```dart
   // Step 1 → 2: Validate type-specific required fields
   if (_investmentTypeId == 1) {
     // Founding: check durationMonths > 0 && profitPercentage > 0
   } else {
     // Equity: check sharePrice > 0 && totalShares > 0
   }
   ```

5. **Updated `_submit()` to handle type-specific values**:
   ```dart
   if (_investmentTypeId == 1) {
     // Founding: Use calculated defaults for share fields
     'sharePrice': 1.0,
     'totalShares': initialCapital,
     'durationMonths': durationMonths,
     'profitPercentage': profitPercentage,
     'payoutFrequency': payoutFrequency,
   } else {
     // Equity: Use actual share values
     'sharePrice': sharePrice,
     'totalShares': totalShares,
     'valuationCap': valuationCap,
   }
   ```

---

### Angular Client Portal
**Files**: 
- `investa-client-portal/src/app/pages/admin/submit-investment/submit-investment.component.ts`
- `investa-client-portal/src/app/pages/admin/submit-investment/submit-investment.component.html`

#### TypeScript Changes:
1. **Added Founding-specific form controls in `initForm()`**:
   ```typescript
   durationMonths: [null],
   profitPercentage: [null],
   payoutFrequency: [''],
   ```

2. **Created `updateValidatorsByType(typeId: InvestmentType)` method**:
   ```typescript
   // Dynamically sets/clears validators based on investment type
   if (typeId === InvestmentType.Equity) {
     this.investmentForm.get('sharePrice')?.setValidators([Validators.required, Validators.min(0.01)]);
     this.investmentForm.get('totalShares')?.setValidators([Validators.required, Validators.min(1)]);
     this.investmentForm.get('valuationCap')?.setValidators([Validators.required, Validators.min(1)]);
     // Clear Founding validators
     this.investmentForm.get('durationMonths')?.clearValidators();
     this.investmentForm.get('profitPercentage')?.clearValidators();
     this.investmentForm.get('payoutFrequency')?.clearValidators();
   } else if (typeId === InvestmentType.Founding) {
     // Reverse: set Founding validators, clear Equity validators
   }
   ```

3. **Wired `investmentTypeId` valueChanges subscription**:
   ```typescript
   this.investmentForm.get('investmentTypeId')?.valueChanges.subscribe(typeId => {
     this.updateValidatorsByType(typeId);
   });
   ```

4. **Conditional target fund calculation** (Equity only):
   ```typescript
   if (this.investmentForm.get('investmentTypeId')?.value === InvestmentType.Equity) {
     // Auto-calculate targetFund = sharePrice × totalShares
   }
   ```

#### HTML Template Changes:
1. **Dynamic step header** based on investment type:
   ```html
   @if (investmentForm.get('investmentTypeId')?.value === 1) {
     <h2>Founding Details</h2>
     <p>Define duration and profit terms</p>
   } @else {
     <h2>Equity Structure</h2>
     <p>Define your equity and funding terms</p>
   }
   ```

2. **Founding-specific fields** (shown when `investmentTypeId === 1`):
   ```html
   @if (investmentForm.get('investmentTypeId')?.value === 1) {
     <!-- Duration (Months) -->
     <!-- Profit Percentage -->
     <!-- Payout Frequency -->
   }
   ```

3. **Equity-specific fields** (shown when `investmentTypeId === 2`):
   ```html
   @if (investmentForm.get('investmentTypeId')?.value === 2) {
     <!-- Share Price -->
     <!-- Total Shares -->
     <!-- Calculated Target Fund (auto-calculated) -->
     <!-- Valuation Cap -->
   }
   ```

4. **Common fields remain visible** for both types (Initial Capital, Currency, Min/Max Investment, Expected ROI, Dates, Media URLs)

---

## Validation Rules

### Founding Type (ID: 1)
- **Required**: `durationMonths` (> 0), `profitPercentage` (> 0), `payoutFrequency` (non-empty)
- **Optional**: `expectedROI`
- **Auto-set**: `sharePrice = 1.0`, `totalShares = initialCapital`

### Equity Type (ID: 2)
- **Required**: `sharePrice` (> 0.01), `totalShares` (> 0), `valuationCap` (> 0)
- **Auto-calculated**: `targetFund = sharePrice × totalShares`
- **Optional**: `expectedROI`

### Common Validation
- **Required**: `businessName`, `description` (min 50 chars), `businessCategoryId`, `businessStageId`, `initialCapital`, `currency`, `startDate`
- **Optional**: `minInvestment`, `maxInvestment`, `endDate`, `imageUrl`, `videoUrl`, `projectPhaseId`, `milestone`

---

## User Experience Flow

### Founding Investment Creation:
1. **Step 1 - Business Details**: Enter business info + select "Founding" type
2. **Step 2 - Founding Details**: 
   - Enter duration in months
   - Set profit percentage
   - Choose payout frequency (Monthly/Quarterly/etc.)
   - Enter initial capital and currency
   - Set min/max investment limits
   - Add dates and media
3. **Step 3 - Images**: Upload up to 5 images (if implemented)
4. **Review & Submit**

### Equity Investment Creation:
1. **Step 1 - Business Details**: Enter business info + select "Equity" type
2. **Step 2 - Equity Structure**:
   - Set share price
   - Define total shares available
   - System auto-calculates target fund
   - Set valuation cap
   - Enter initial capital and currency
   - Set min/max investment limits
   - Add dates and media
3. **Step 3 - Images**: Upload up to 5 images (if implemented)
4. **Review & Submit**

---

## Backend Requirements

### ✅ Completed Updates:
1. **CreateInvestmentDto** - Added optional Founding fields:
   ```csharp
   public int? DurationMonths { get; set; }
   public decimal? ProfitPercentage { get; set; }
   public string? PayoutFrequency { get; set; }
   ```

2. **UpdateInvestmentDto** - Added optional Founding fields for editing investments

3. **InvestmentDto** - Added Founding fields to response DTO for API responses

4. **Investment Entity** - Added columns with proper SQL types and documentation:
   ```csharp
   public int? DurationMonths { get; set; }
   [Column(TypeName = "decimal(5,2)")]
   public decimal? ProfitPercentage { get; set; }
   [StringLength(50)]
   public string? PayoutFrequency { get; set; }
   ```

5. **CreateInvestmentDtoValidator** - Type-specific conditional validation:
   - **Founding type**: Validates DurationMonths > 0, ProfitPercentage > 0, PayoutFrequency required and must be one of allowed values
   - **Equity type**: Validates SharePrice > 0.01, TotalShares > 0, ValuationCap > 0
   ```csharp
   RuleFor(x => x.DurationMonths)
       .GreaterThan(0)
       .When(x => x.InvestmentTypeId == InvestmentType.Founding)
       .WithMessage("Duration in months is required for Founding investments.");
   ```

6. **InvestmentService** - Updated CreateAsync and UpdateAsync methods to map Founding fields

7. **Database Migration** - Created SQL migration script at `Core-BackEnd/scripts/AddFoundingInvestmentFields.sql`:
   - Adds nullable columns for backward compatibility
   - Includes check constraint for PayoutFrequency values
   - Adds column descriptions for documentation

---

## Testing Checklist

### Flutter Founder App:
- [ ] Create Founding investment (verify duration/profit fields are required)
- [ ] Create Equity investment (verify share fields are required)
- [ ] Switch between types in Step 1 (verify fields in Step 2 change)
- [ ] Validation prevents advancing with missing required fields
- [ ] Submission works for both types
- [ ] Images upload correctly (if implemented)

### Angular Client Portal:
- [ ] Create Founding investment (verify dynamic validators work)
- [ ] Create Equity investment (verify target fund auto-calculates)
- [ ] Switch between types (verify fields show/hide correctly)
- [ ] Form validation displays correct error messages
- [ ] Submission sends correct data to backend
- [ ] Review step shows type-specific summary

### Backend API:
- [x] Accepts Founding-specific fields in CreateInvestmentDto
- [x] Accepts Founding-specific fields in UpdateInvestmentDto
- [x] Stores Founding data correctly in Investment entity
- [x] Validates type-specific required fields server-side (FluentValidation)
- [x] Returns Founding fields in InvestmentDto responses
- [ ] Database migration executed (SQL script ready)
- [ ] Handles both investment types in GET endpoints (already supported via AutoMapper)

---

## Migration Path

### Current State:
- ✅ Flutter UI implementation complete
- ✅ Angular TypeScript logic complete
- ✅ Angular template conditionals complete
- ✅ Backend DTOs updated (Create, Update, Response)
- ✅ Backend entity updated with new columns
- ✅ Server-side type-specific validation complete
- ✅ InvestmentService.CreateAsync and UpdateAsync updated
- ✅ Database migration script created
- ⏳ Database migration execution pending (run AddFoundingInvestmentFields.sql)
- ⏳ E2E testing pending

### Next Steps:
1. **Run database migration**: Execute `Core-BackEnd/scripts/AddFoundingInvestmentFields.sql` on your database
2. Test Founding investment creation in Flutter and Angular
3. Test Equity investment creation (ensure no regression)
4. Verify validation messages appear correctly for both types
5. Test update functionality for both investment types
6. Verify API responses include Founding fields when applicable

---

## Files Modified

### Flutter Founder:
- `Flutter_Founder/lib/screens/new_investment_screen.dart` ✅

### Angular Client Portal:
- `investa-client-portal/src/app/pages/admin/submit-investment/submit-investment.component.ts` ✅
- `investa-client-portal/src/app/pages/admin/submit-investment/submit-investment.component.html` ✅

### Backend (.NET):
- `Core-BackEnd/Investa.Application/DTOs/CreateInvestmentDto.cs` ✅
- `Core-BackEnd/Investa.Application/DTOs/UpdateInvestmentDto.cs` ✅
- `Core-BackEnd/Investa.Application/DTOs/InvestmentDto.cs` ✅
- `Core-BackEnd/Investa.Application/DTOs/Validators/CreateInvestmentDtoValidator.cs` ✅
- `Core-BackEnd/Investa.Domain/Entities/Investment.cs` ✅
- `Core-BackEnd/Investa.Application/Services/InvestmentService.cs` ✅
- `Core-BackEnd/scripts/AddFoundingInvestmentFields.sql` ✅ (NEW - migration script)

### Documentation:
- `INVESTMENT_TYPE_FLOW_REFACTORING.md` ✅

---

## Success Criteria

✅ **Completed**:
1. Users can select between Founding and Equity investment types
2. Form fields dynamically change based on selected type
3. Validation enforces type-specific required fields (client & server)
4. Flutter app conditionally renders Founding or Equity fields in Step 2
5. Angular app uses dynamic validators and conditional template rendering
6. Both apps maintain common fields for both types
7. No TypeScript/Dart compilation errors
8. Backend DTOs accept and store type-specific data
9. Server-side FluentValidation enforces type-specific business rules
10. Database entity supports all fields (nullable for backward compatibility)
11. Migration script ready for deployment

⏳ **Pending**:
1. Execute database migration script
2. E2E testing confirms both flows work correctly
3. Regression testing for existing Equity investments
4. Image upload max 5 server-side validation (separate feature)
5. Production deployment

---

## Notes

- **Backward Compatibility**: Existing Equity investments should continue to work without changes
- **Data Migration**: If Founding investments already exist in the database, migration scripts may be needed
- **UI/UX**: Investment type selection moved to Step 1 for better UX (type determines which fields appear in Step 2)
- **Defaults**: Founding type uses `sharePrice=1.0` and `totalShares=initialCapital` as defaults to maintain backend compatibility while the schema is updated
- **Extensibility**: This pattern makes it easy to add more investment types in the future (e.g., Convertible Notes, SAFE agreements)
