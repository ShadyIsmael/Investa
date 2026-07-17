using System;

namespace Investa.Application.DTOs.Finance;

public class FinanceReconciliationDto
{
    public int Id { get; set; }
    public int FinanceAccountId { get; set; }
    public string? FinanceAccountName { get; set; }
    public string? FinanceAccountCode { get; set; }
    public string? FinanceAccountCurrency { get; set; }
    public DateTime ReconciliationDate { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal PeriodActivity { get; set; }
    public decimal SystemCalculatedBalance { get; set; }
    public decimal ActualStatementBalance { get; set; }
    public decimal Difference { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? CreatedByDisplayName { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public string? UpdatedByDisplayName { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? ConfirmedBy { get; set; }
    public string? ConfirmedByDisplayName { get; set; }
    public DateTime? ConfirmedAt { get; set; }

    public bool CanEdit { get; set; }
    public bool CanRecalculate { get; set; }
    public bool CanConfirm { get; set; }
    public bool CanDelete { get; set; }
}

public class CreateFinanceReconciliationDto
{
    public int FinanceAccountId { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    public decimal ActualStatementBalance { get; set; }
    public DateTime? ReconciliationDate { get; set; }
    public string? Notes { get; set; }
}

public class FinanceReconciliationListDto
{
    public int Id { get; set; }
    public int FinanceAccountId { get; set; }
    public string? FinanceAccountName { get; set; }
    public string? FinanceAccountCode { get; set; }
    public string? FinanceAccountCurrency { get; set; }
    public DateTime ReconciliationDate { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal PeriodActivity { get; set; }
    public decimal SystemCalculatedBalance { get; set; }
    public decimal ActualStatementBalance { get; set; }
    public decimal Difference { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public Guid? CreatedBy { get; set; }
    public string? CreatedByDisplayName { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? ConfirmedBy { get; set; }
    public string? ConfirmedByDisplayName { get; set; }
    public DateTime? ConfirmedAt { get; set; }

    public bool CanEdit { get; set; }
    public bool CanRecalculate { get; set; }
    public bool CanConfirm { get; set; }
    public bool CanDelete { get; set; }
}

public class UpdateStatementBalanceDto
{
    public decimal ActualStatementBalance { get; set; }
}
