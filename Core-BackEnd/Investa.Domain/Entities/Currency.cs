using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public sealed class Currency
{
    [Key, StringLength(3, MinimumLength = 3)]
    public string ISOCode { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string EnglishName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string ArabicName { get; set; } = string.Empty;

    [Required, StringLength(10)]
    public string Symbol { get; set; } = string.Empty;

    [Range(0, 6)]
    public int DecimalDigits { get; set; } = 2;

    public bool IsActive { get; set; } = true;
    public bool SupportsFunding { get; set; }
    public bool SupportsSettlement { get; set; }
    public bool SupportsWallet { get; set; }
}
