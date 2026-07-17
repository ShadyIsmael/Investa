using System;
using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

/// <summary>
/// Expense category for company operating finance.
/// Examples: Rent, Utilities, Salaries, Office Supplies, etc.
/// </summary>
public class ExpenseCategory
{
    [Key]
    public int Id { get; set; }

    /// <summary>Category code (e.g., "EXP-001")</summary>
    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    /// <summary>Category name (user-facing)</summary>
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    /// <summary>Description of the expense type</summary>
    [StringLength(500)]
    public string? Description { get; set; }

    /// <summary>GL account code for accounting integration</summary>
    [StringLength(50)]
    public string? GLAccountCode { get; set; }

    /// <summary>Display order in UI dropdowns</summary>
    public int SortOrder { get; set; } = 0;

    /// <summary>Whether category is active</summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    // Navigation
    public ICollection<FinanceTransaction> Transactions { get; set; } = new List<FinanceTransaction>();
}
