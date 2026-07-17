using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Company finance account (bank account, cash box, wallet, etc.).
/// Used to track where money flows in and out.
/// Company operating finance only - not for investor/project/opportunity money.
/// </summary>
public class FinanceAccount
{
    [Key]
    public int Id { get; set; }

    /// <summary>Account code (e.g., "BANK-001", "CASH-PETTY")</summary>
    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    /// <summary>Display name (e.g., "Main Bank Account", "Petty Cash")</summary>
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Description of the account purpose</summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>Account type (BankAccount, CashBox, PaymentWallet, CreditCard, etc.)</summary>
    [Required]
    [StringLength(50)]
    public string AccountType { get; set; } = string.Empty;

    /// <summary>Base currency (EGP)</summary>
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "EGP";

    /// <summary>Current balance in base currency</summary>
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal CurrentBalance { get; set; } = 0m;

    /// <summary>Bank account number or identifier (if applicable)</summary>
    [StringLength(100)]
    public string? BankAccountNumber { get; set; }

    /// <summary>Bank name (if applicable)</summary>
    [StringLength(100)]
    public string? BankName { get; set; }

    /// <summary>Account opening date</summary>
    public DateTime? OpeningDate { get; set; }

    /// <summary>Whether the account is active</summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

}
