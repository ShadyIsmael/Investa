using Investa.Domain.Entities.Enums;

namespace Investa.Application.Extensions;

/// <summary>
/// Extension methods for InvestmentType enum to support display names and descriptions.
/// Provides a centralized, extensible way to work with investment types.
/// </summary>
public static class InvestmentTypeExtensions
{
    /// <summary>
    /// Gets the display name for the investment type.
    /// </summary>
    public static string GetDisplayName(this InvestmentType type)
    {
        return type switch
        {
            InvestmentType.Founding => "Founding Investment",
            InvestmentType.Equity => "Equity Investment",
            _ => type.ToString()
        };
    }

    /// <summary>
    /// Gets a detailed description of the investment type.
    /// </summary>
    public static string GetDescription(this InvestmentType type)
    {
        return type switch
        {
            InvestmentType.Founding => "Initial capital contribution by the founder/business owner into their own venture.",
            InvestmentType.Equity => "Share-based investment by external investors in exchange for ownership percentage.",
            _ => "Unknown investment type"
        };
    }

    /// <summary>
    /// Gets the investment type code (for backward compatibility or API responses).
    /// </summary>
    public static string GetCode(this InvestmentType type)
    {
        return type switch
        {
            InvestmentType.Founding => "founding",
            InvestmentType.Equity => "equity",
            _ => type.ToString().ToLowerInvariant()
        };
    }

    /// <summary>
    /// Parses a string code into an InvestmentType.
    /// </summary>
    public static InvestmentType? FromCode(string? code)
    {
        if (string.IsNullOrWhiteSpace(code)) return null;

        return code.Trim().ToLowerInvariant() switch
        {
            "founding" => InvestmentType.Founding,
            "equity" => InvestmentType.Equity,
            _ => null
        };
    }
}
