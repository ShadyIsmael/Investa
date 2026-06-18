using System.Runtime.Serialization;

namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Strongly typed logical request kind stored in InvestmentRequest.RequestType as a string key.
/// Canonical keys are used for persistence to support backward compatibility.
/// </summary>
public enum InvestmentRequestType
{
    [EnumMember(Value = "contact_founder")]
    ContactFounder = 1,

    // Historical legacy value (pre-enum) may have been "investment_request".
    // Canonical key for the invest flow is "investment_interest".
    [EnumMember(Value = "investment_interest")]
    InvestmentInterest = 2
}

/// <summary>
/// Centralized parsing/canonicalization for InvestmentRequestType <-> persisted string keys.
/// </summary>
public static class InvestmentRequestTypeCodec
{
    public const string LegacyInvestmentRequest = "investment_request";

    public static InvestmentRequestType Parse(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException("RequestType is required.");

        var normalized = value.Trim();

        // Backward compatibility mapping for old records
        if (string.Equals(normalized, LegacyInvestmentRequest, StringComparison.OrdinalIgnoreCase))
            return InvestmentRequestType.InvestmentInterest;

        // Canonical keys via EnumMember
        foreach (var candidate in Enum.GetValues<InvestmentRequestType>())
        {
            var enumValue = GetEnumMemberValue(candidate);
            if (enumValue != null && string.Equals(enumValue, normalized, StringComparison.OrdinalIgnoreCase))
                return candidate;
        }

        throw new InvalidOperationException($"Unsupported RequestType: '{value}'.");
    }

    public static string ToPersistedString(InvestmentRequestType type)
    {
        var enumValue = GetEnumMemberValue(type);
        if (string.IsNullOrWhiteSpace(enumValue))
            throw new InvalidOperationException($"No persisted string mapping for {type}.");

        return enumValue;
    }

    private static string? GetEnumMemberValue(InvestmentRequestType type)
    {
        var member = typeof(InvestmentRequestType).GetMember(type.ToString()).FirstOrDefault();
        if (member == null) return null;

        var attr = member.GetCustomAttributes(typeof(EnumMemberAttribute), false)
            .FirstOrDefault() as EnumMemberAttribute;

        return attr?.Value;
    }
}
