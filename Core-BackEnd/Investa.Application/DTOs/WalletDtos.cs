using System;
using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;
namespace Investa.Application.DTOs;
/// <summary>
/// Read model of a wallet (used by GET endpoints and clients).
/// </summary>
public class WalletDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal TotalPurchasedCredits { get; set; }
    public decimal TotalBonusCredits { get; set; }
    public decimal TotalRefundCredits { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
/// <summary>
/// Read model of a single wallet transaction row.
/// </summary>
public class WalletTransactionDto
{
    public Guid Id { get; set; }
    public Guid WalletId { get; set; }
    public WalletDirection Direction { get; set; }
    public WalletReason Reason { get; set; }
    public string? ActionCode { get; set; }
    public decimal CreditAmount { get; set; }
    public decimal BalanceBefore { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? ReferenceId { get; set; }
    public ReferenceType ReferenceType { get; set; }
    public string? Description { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}
/// <summary>
/// Input for an admin-triggered credit. Used by POST /api/v1/wallet/credit.
/// </summary>
public class CreditWalletRequest
{
    [Required]
    public Guid UserId { get; set; }
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }
    [Required]
    public WalletReason Reason { get; set; }
    [Required]
    public ReferenceType ReferenceType { get; set; } = ReferenceType.Admin;
    [StringLength(100)]
    public string? ReferenceId { get; set; }
    [StringLength(500)]
    public string? Description { get; set; }
    /// <summary>Admin user id performing the credit. Optional; if null the system records the call as anonymous (still allowed for admin endpoints).</summary>
    public Guid? CreatedByUserId { get; set; }
}
/// <summary>
/// Input for an admin-triggered debit. Used by POST /api/v1/wallet/debit.
/// </summary>
public class DebitWalletRequest
{
    [Required]
    public Guid UserId { get; set; }
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }
    [Required]
    public WalletReason Reason { get; set; }
    [Required]
    public ReferenceType ReferenceType { get; set; } = ReferenceType.Admin;
    [StringLength(100)]
    public string? ReferenceId { get; set; }
    [StringLength(500)]
    public string? Description { get; set; }
    public Guid? CreatedByUserId { get; set; }
}
