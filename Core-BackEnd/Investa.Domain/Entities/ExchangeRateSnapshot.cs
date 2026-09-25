using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Immutable audit record of the exact FX quote used by a financial operation.
/// Historical financial records must reference this row and never be repriced.
/// </summary>
public class ExchangeRateSnapshot
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, StringLength(3)]
    public string SourceCurrency { get; set; } = string.Empty;

    [Required, StringLength(3)]
    public string TargetCurrency { get; set; } = string.Empty;

    [Column(TypeName = "decimal(28,12)")]
    public decimal ExchangeRate { get; set; }

    public DateTime RateTimestamp { get; set; }

    [Required, StringLength(100)]
    public string Provider { get; set; } = string.Empty;

    [StringLength(200)]
    public string? ProviderQuoteId { get; set; }

    public bool IsManualOverride { get; set; }
    public bool IsOfflineFallback { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
