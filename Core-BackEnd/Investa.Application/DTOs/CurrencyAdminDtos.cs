using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public sealed class CurrencyAdminDto
{
    public string ISOCode { get; init; } = string.Empty;
    public string EnglishName { get; init; } = string.Empty;
    public string ArabicName { get; init; } = string.Empty;
    public string Symbol { get; init; } = string.Empty;
    public int DecimalDigits { get; init; }
    public bool IsActive { get; init; }
    public bool SupportsFunding { get; init; }
    public bool SupportsSettlement { get; init; }
    public bool SupportsWallet { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public Guid? CreatedByUserId { get; init; }
    public Guid? UpdatedByUserId { get; init; }
    public CurrencyUsageDto Usage { get; init; } = new();
}

public sealed class CurrencyUsageDto
{
    public int TotalReferences { get; init; }
    public bool IsReferenced => TotalReferences > 0;
}

public class CreateCurrencyRequest
{
    [Required, StringLength(3, MinimumLength = 3)]
    public string ISOCode { get; set; } = string.Empty;

    [Required, StringLength(100)] public string EnglishName { get; set; } = string.Empty;
    [Required, StringLength(100)] public string ArabicName { get; set; } = string.Empty;
    [Required, StringLength(10)] public string Symbol { get; set; } = string.Empty;
    [Range(0, 6)] public int DecimalDigits { get; set; } = 2;
    public bool IsActive { get; set; } = true;
    public bool SupportsFunding { get; set; }
    public bool SupportsSettlement { get; set; }
    public bool SupportsWallet { get; set; }
}

public sealed class UpdateCurrencyRequest
{
    [Required, StringLength(100)] public string EnglishName { get; set; } = string.Empty;
    [Required, StringLength(100)] public string ArabicName { get; set; } = string.Empty;
    [Required, StringLength(10)] public string Symbol { get; set; } = string.Empty;
    [Range(0, 6)] public int DecimalDigits { get; set; } = 2;
    public bool IsActive { get; set; } = true;
    public bool SupportsFunding { get; set; }
    public bool SupportsSettlement { get; set; }
    public bool SupportsWallet { get; set; }
}

public sealed class SetCurrencyStatusRequest
{
    public bool IsActive { get; set; }
}
