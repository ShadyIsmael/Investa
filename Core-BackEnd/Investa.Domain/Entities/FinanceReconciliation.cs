using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class FinanceReconciliation
{
    [Key]
    public int Id { get; set; }

    public int FinanceAccountId { get; set; }
    public FinanceAccount? FinanceAccount { get; set; }

    public DateTime ReconciliationDate { get; set; }
    public DateTime PeriodStartDate { get; set; }
    public DateTime PeriodEndDate { get; set; }

    [Column(TypeName = "decimal(19, 4)")]
    public decimal OpeningBalance { get; set; }

    [Column(TypeName = "decimal(19, 4)")]
    public decimal PeriodActivity { get; set; }

    [Column(TypeName = "decimal(19, 4)")]
    public decimal SystemCalculatedBalance { get; set; }

    [Column(TypeName = "decimal(19, 4)")]
    public decimal ActualStatementBalance { get; set; }

    [Column(TypeName = "decimal(19, 4)")]
    public decimal Difference { get; set; }

    public FinanceReconciliationStatus Status { get; set; } = FinanceReconciliationStatus.Draft;

    [StringLength(1000)]
    public string? Notes { get; set; }

    public Guid? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? ConfirmedBy { get; set; }
    public DateTime? ConfirmedAt { get; set; }
}
