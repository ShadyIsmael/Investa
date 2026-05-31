using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public enum TransactionType
{
    Deposit,
    Withdrawal,
    Investment
}

public class Transaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid WalletId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    public TransactionType Type { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    // Navigation property
    [ForeignKey(nameof(WalletId))]
    public AuthUser Wallet { get; set; } = null!;
}