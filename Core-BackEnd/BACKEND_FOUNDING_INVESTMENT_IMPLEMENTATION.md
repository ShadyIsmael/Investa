# Backend Implementation: Founding Investment Type Support

## Summary
Implemented backend support for Founding investment type with duration-based, profit-sharing model alongside the existing Equity (share-based) investment type.

---

## Changes Made

### 1. DTOs Updated

#### CreateInvestmentDto.cs
**Added fields:**
```csharp
// Founding-specific fields (fixed duration with profit-based returns)
public int? DurationMonths { get; set; }
public decimal? ProfitPercentage { get; set; }
public string? PayoutFrequency { get; set; } // Monthly, Quarterly, Semi-Annually, Annually, At Maturity
```

#### UpdateInvestmentDto.cs
**Added fields:**
```csharp
// Founding-specific fields
public int? DurationMonths { get; set; }
public decimal? ProfitPercentage { get; set; }
public string? PayoutFrequency { get; set; }
```

#### InvestmentDto.cs
**Added fields:**
```csharp
// Founding-specific fields
public int? DurationMonths { get; set; }
public decimal? ProfitPercentage { get; set; }
public string? PayoutFrequency { get; set; }
```

---

### 2. Domain Entity Updated

#### Investment.cs
**Added properties with proper annotations:**
```csharp
// ==================== Founding-Specific Fields ====================

/// <summary>
/// Duration of the investment in months (Founding type only)
/// </summary>
public int? DurationMonths { get; set; }

/// <summary>
/// Profit percentage for investors (Founding type only)
/// </summary>
[Column(TypeName = "decimal(5,2)")]
public decimal? ProfitPercentage { get; set; }

/// <summary>
/// Payout frequency: Monthly, Quarterly, Semi-Annually, Annually, At Maturity (Founding type only)
/// </summary>
[StringLength(50)]
public string? PayoutFrequency { get; set; }
```

**Key decisions:**
- All fields nullable for backward compatibility with existing Equity investments
- ProfitPercentage uses `decimal(5,2)` to support values like 12.50%
- PayoutFrequency has max length of 50 characters

---

### 3. Validation Logic

#### CreateInvestmentDtoValidator.cs
**Conditional validation based on InvestmentType:**

**Equity Type (InvestmentType.Equity):**
```csharp
RuleFor(x => x.SharePrice)
    .GreaterThan(0m)
    .When(x => x.InvestmentTypeId == InvestmentType.Equity)
    .WithMessage("Share price must be greater than zero for Equity investments.");

RuleFor(x => x.TotalShares)
    .GreaterThan(0)
    .When(x => x.InvestmentTypeId == InvestmentType.Equity)
    .WithMessage("Total shares must be greater than zero for Equity investments.");

RuleFor(x => x.ValuationCap)
    .GreaterThan(0m)
    .When(x => x.InvestmentTypeId == InvestmentType.Equity && x.ValuationCap.HasValue)
    .WithMessage("Valuation cap must be greater than zero for Equity investments.");
```

**Founding Type (InvestmentType.Founding):**
```csharp
RuleFor(x => x.DurationMonths)
    .GreaterThan(0)
    .When(x => x.InvestmentTypeId == InvestmentType.Founding)
    .WithMessage("Duration in months is required for Founding investments.");

RuleFor(x => x.ProfitPercentage)
    .GreaterThan(0m)
    .When(x => x.InvestmentTypeId == InvestmentType.Founding)
    .WithMessage("Profit percentage is required for Founding investments.");

RuleFor(x => x.PayoutFrequency)
    .NotEmpty()
    .When(x => x.InvestmentTypeId == InvestmentType.Founding)
    .WithMessage("Payout frequency is required for Founding investments.")
    .Must(x => x == null || new[] { "Monthly", "Quarterly", "Semi-Annually", "Annually", "At Maturity" }.Contains(x))
    .When(x => x.InvestmentTypeId == InvestmentType.Founding && !string.IsNullOrEmpty(x.PayoutFrequency))
    .WithMessage("Payout frequency must be one of: Monthly, Quarterly, Semi-Annually, Annually, At Maturity.");
```

**Key features:**
- Uses `.When()` clause to conditionally apply validators based on InvestmentTypeId
- Only enforces Founding fields when InvestmentType is Founding
- Only enforces Equity fields when InvestmentType is Equity
- Validates PayoutFrequency against allowed values

---

### 4. Service Layer

#### InvestmentService.cs

**CreateAsync method - Added mapping:**
```csharp
ValuationCap = dto.ValuationCap,
ExpectedROI = dto.ExpectedROI,
InvestmentTypeId = dto.InvestmentTypeId ?? InvestmentType.Equity,
Status = "Draft",
EndDate = dto.EndDate,
ImageUrl = dto.ImageUrl,
VideoUrl = dto.VideoUrl,
// Founding-specific fields
DurationMonths = dto.DurationMonths,
ProfitPercentage = dto.ProfitPercentage,
PayoutFrequency = dto.PayoutFrequency
```

**UpdateAsync method - Added mapping:**
```csharp
if (dto.ImageUrl != null) entity.ImageUrl = dto.ImageUrl;
if (dto.VideoUrl != null) entity.VideoUrl = dto.VideoUrl;
// Founding-specific fields
if (dto.DurationMonths.HasValue) entity.DurationMonths = dto.DurationMonths;
if (dto.ProfitPercentage.HasValue) entity.ProfitPercentage = dto.ProfitPercentage;
if (dto.PayoutFrequency != null) entity.PayoutFrequency = dto.PayoutFrequency;
```

**Key features:**
- CreateAsync maps all Founding fields from DTO to entity
- UpdateAsync only updates fields if provided (nullable check)
- No special business logic needed - validation handles type-specific rules

---

### 5. Database Migration

**File:** `Core-BackEnd/scripts/AddFoundingInvestmentFields.sql`

**Features:**
- Adds 3 new columns: DurationMonths (INT), ProfitPercentage (DECIMAL(5,2)), PayoutFrequency (NVARCHAR(50))
- All columns nullable for backward compatibility
- Includes idempotent checks (won't fail if columns already exist)
- Adds check constraint for PayoutFrequency valid values
- Adds extended properties (column descriptions) for documentation
- Transaction-safe with informative PRINT statements

**To execute:**
```bash
# Option 1: SQL Server Management Studio
# Open the file and execute against your database

# Option 2: sqlcmd
sqlcmd -S your_server -d your_database -i AddFoundingInvestmentFields.sql

# Option 3: PowerShell
Invoke-Sqlcmd -ServerInstance your_server -Database your_database -InputFile AddFoundingInvestmentFields.sql
```

---

## API Behavior

### POST /api/v1/investments (Create Investment)

**Founding Type Example:**
```json
{
  "founderId": "guid-here",
  "initialCapital": 50000,
  "businessName": "TechStartup Inc",
  "description": "Innovative SaaS platform...",
  "startDate": "2026-02-01",
  "businessStageId": 2,
  "businessCategoryId": 5,
  "milestone": "MVP Launch",
  "riskLevel": "Medium",
  "targetFund": 100000,
  "currency": "USD",
  "investmentTypeId": 1,
  "durationMonths": 24,
  "profitPercentage": 15.5,
  "payoutFrequency": "Quarterly",
  "expectedROI": 18.0,
  "endDate": "2028-02-01"
}
```

**Equity Type Example:**
```json
{
  "founderId": "guid-here",
  "initialCapital": 50000,
  "businessName": "TechStartup Inc",
  "description": "Innovative SaaS platform...",
  "startDate": "2026-02-01",
  "businessStageId": 2,
  "businessCategoryId": 5,
  "milestone": "MVP Launch",
  "riskLevel": "Medium",
  "targetFund": 100000,
  "currency": "USD",
  "investmentTypeId": 2,
  "sharePrice": 10.00,
  "totalShares": 10000,
  "valuationCap": 500000,
  "expectedROI": 20.0,
  "endDate": "2028-02-01"
}
```

---

## Validation Error Responses

### Founding Investment Missing Required Fields
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "DurationMonths": ["Duration in months is required for Founding investments."],
    "ProfitPercentage": ["Profit percentage is required for Founding investments."],
    "PayoutFrequency": ["Payout frequency is required for Founding investments."]
  }
}
```

### Invalid PayoutFrequency
```json
{
  "errors": {
    "PayoutFrequency": ["Payout frequency must be one of: Monthly, Quarterly, Semi-Annually, Annually, At Maturity."]
  }
}
```

### Equity Investment Missing Required Fields
```json
{
  "errors": {
    "SharePrice": ["Share price must be greater than zero for Equity investments."],
    "TotalShares": ["Total shares must be greater than zero for Equity investments."]
  }
}
```

---

## Backward Compatibility

### Existing Equity Investments
- ✅ No migration needed - new columns are nullable
- ✅ Existing records will have NULL values for Founding fields
- ✅ GET requests return NULL for DurationMonths, ProfitPercentage, PayoutFrequency
- ✅ Validation still enforces Equity-specific rules (SharePrice, TotalShares required)

### Default Behavior
- If `InvestmentTypeId` is not provided in CreateInvestmentDto, defaults to `InvestmentType.Equity` (existing behavior preserved)
- Nullable Founding fields ensure no breaking changes to existing API consumers

---

## Testing Recommendations

### Unit Tests (CreateInvestmentDtoValidator)
```csharp
[Fact]
public void Should_Require_Duration_When_Founding_Type()
{
    var dto = new CreateInvestmentDto { InvestmentTypeId = InvestmentType.Founding };
    var validator = new CreateInvestmentDtoValidator();
    var result = validator.Validate(dto);
    result.Errors.Should().Contain(e => e.PropertyName == "DurationMonths");
}

[Fact]
public void Should_Require_SharePrice_When_Equity_Type()
{
    var dto = new CreateInvestmentDto { InvestmentTypeId = InvestmentType.Equity };
    var validator = new CreateInvestmentDtoValidator();
    var result = validator.Validate(dto);
    result.Errors.Should().Contain(e => e.PropertyName == "SharePrice");
}
```

### Integration Tests
1. **POST Founding investment** with all required fields → 201 Created
2. **POST Founding investment** missing DurationMonths → 400 Bad Request with validation error
3. **POST Founding investment** with invalid PayoutFrequency → 400 Bad Request
4. **POST Equity investment** with all required fields → 201 Created (regression test)
5. **GET investment** by ID → Returns Founding fields when type is Founding
6. **PUT investment** to update Founding fields → 204 No Content

### E2E Tests
1. Create Founding investment from Flutter app → Verify in database
2. Create Equity investment from Angular app → Verify in database
3. View Founding investment details in mobile/web apps
4. Edit Founding investment fields (duration, profit %)
5. List all investments → Both types display correctly

---

## Deployment Checklist

- [ ] Review and test code changes locally
- [ ] Run all unit tests
- [ ] Run integration tests
- [ ] **Execute database migration** (`AddFoundingInvestmentFields.sql`)
- [ ] Verify migration success (check new columns exist)
- [ ] Deploy backend API changes
- [ ] Deploy Flutter app update
- [ ] Deploy Angular app update
- [ ] Smoke test: Create one Founding investment
- [ ] Smoke test: Create one Equity investment (regression)
- [ ] Monitor logs for validation errors

---

## Database Schema Summary

### Investments Table - New Columns

| Column Name       | Data Type       | Nullable | Description                                           |
|-------------------|-----------------|----------|-------------------------------------------------------|
| DurationMonths    | INT             | Yes      | Investment duration in months (Founding type only)    |
| ProfitPercentage  | DECIMAL(5,2)    | Yes      | Profit % for investors (Founding type only)           |
| PayoutFrequency   | NVARCHAR(50)    | Yes      | Payout schedule (Founding type only)                  |

**Constraints:**
- `CK_Investments_PayoutFrequency`: CHECK constraint ensuring PayoutFrequency is NULL or one of: 'Monthly', 'Quarterly', 'Semi-Annually', 'Annually', 'At Maturity'

---

## AutoMapper Configuration

**Note:** No changes needed to AutoMapper profiles. AutoMapper automatically maps properties with matching names between:
- `Investment` entity ↔ `InvestmentDto`
- `CreateInvestmentDto` → `Investment` (handled manually in InvestmentService.CreateAsync)
- `UpdateInvestmentDto` → `Investment` (handled manually in InvestmentService.UpdateAsync)

If using AutoMapper for Create/Update DTOs, add these mappings to your profile:
```csharp
CreateMap<CreateInvestmentDto, Investment>()
    .ForMember(dest => dest.DurationMonths, opt => opt.MapFrom(src => src.DurationMonths))
    .ForMember(dest => dest.ProfitPercentage, opt => opt.MapFrom(src => src.ProfitPercentage))
    .ForMember(dest => dest.PayoutFrequency, opt => opt.MapFrom(src => src.PayoutFrequency));
```

---

## Known Limitations / Future Enhancements

1. **Payout Calculations**: Backend does not yet implement automatic payout calculations based on DurationMonths and PayoutFrequency. This should be added as a scheduled background job.

2. **Investment Maturity**: No automatic status change when DurationMonths expires. Consider adding:
   - Background job to check for matured Founding investments
   - Automatic status change from "Active" → "Matured"
   - Notification to founder and investors

3. **Profit Distribution**: Backend accepts ProfitPercentage but does not implement profit distribution logic. Future enhancement should include:
   - Profit entry by founder
   - Automatic calculation of investor payouts
   - Payout history tracking

4. **Validation Rules**: Current validation is basic. Consider adding:
   - Maximum duration limits (e.g., 120 months)
   - ProfitPercentage range validation (e.g., 0-100%)
   - Business rule: Founding investments should have EndDate = StartDate + DurationMonths

5. **Reporting**: Add queries/endpoints for:
   - Upcoming payouts (grouped by frequency)
   - Matured investments
   - Founding vs Equity investment counts

---

## Support / Troubleshooting

### Migration Fails: Column Already Exists
**Solution:** The migration script is idempotent. If columns exist, it will skip creation. Safe to re-run.

### Validation Fails with "Share price is required" for Founding Investment
**Check:** Ensure `InvestmentTypeId` is set to `1` (Founding) in the request body. Default is `2` (Equity).

### Founding Fields Not Returned in GET Response
**Check:** 
1. Verify migration was executed (columns exist in database)
2. Ensure InvestmentDto includes the fields (already done)
3. Check AutoMapper configuration (should auto-map matching property names)

### Invalid PayoutFrequency Value
**Solution:** Must be exactly one of: "Monthly", "Quarterly", "Semi-Annually", "Annually", "At Maturity" (case-sensitive).

---

## Related Documentation

- [INVESTMENT_TYPE_FLOW_REFACTORING.md](../INVESTMENT_TYPE_FLOW_REFACTORING.md) - Full implementation guide (Frontend + Backend)
- Entity Framework Migration (if using EF): Run `Add-Migration AddFoundingFields` and `Update-Database`
- API Swagger Documentation: `/swagger` - View updated endpoint schemas after deployment
