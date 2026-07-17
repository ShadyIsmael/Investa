using System;

namespace Investa.Application.DTOs.Finance;

/// <summary>
/// DTO for Finance Account (user-facing).
/// Simplified view of account data without internal accounting details.
/// </summary>
public class FinanceAccountDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AccountType { get; set; } = string.Empty;
    public string Currency { get; set; } = "EGP";
    public decimal CurrentBalance { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public DateTime? OpeningDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>DTO for creating or updating a Finance Account.</summary>
public class CreateUpdateFinanceAccountDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AccountType { get; set; } = string.Empty;
    public string Currency { get; set; } = "EGP";
    public string? BankAccountNumber { get; set; }
    public string? BankName { get; set; }
    public DateTime? OpeningDate { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>DTO for listing Finance Accounts with basic info.</summary>
public class FinanceAccountListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string AccountType { get; set; } = string.Empty;
    public decimal CurrentBalance { get; set; }
    public bool IsActive { get; set; }
}
