using System.Text.Json;

namespace Investa.Application.Services;

public enum TermsSnapshotKind
{
    None,
    Malformed,
    ObjectLegacy,
    ArrayAcceptedOffer
}

public readonly record struct TermsParseResult(TermsSnapshotKind Kind, JsonElement? Normalized);

public static class TermsSnapshotParser
{
    public static TermsParseResult Parse(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new(TermsSnapshotKind.None, null);

        JsonDocument document;
        try
        {
            document = JsonDocument.Parse(json);
        }
        catch (JsonException)
        {
            return new(TermsSnapshotKind.Malformed, null);
        }

        using (document)
        {
            var root = document.RootElement;

            if (root.ValueKind == JsonValueKind.Object)
                return new(TermsSnapshotKind.ObjectLegacy, root.Clone());

            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
            {
                var normalized = NormalizeLegs(root);
                return new(TermsSnapshotKind.ArrayAcceptedOffer, normalized);
            }

            return new(TermsSnapshotKind.Malformed, null);
        }
    }

    private static JsonElement NormalizeLegs(JsonElement array)
    {
        var props = new Dictionary<string, JsonElement>(StringComparer.OrdinalIgnoreCase);

        foreach (var leg in array.EnumerateArray())
        {
            var legType = leg.TryGetProperty("LegType", out var lt) && lt.ValueKind == JsonValueKind.Number
                ? lt.GetInt32() : 0;

            CopyProperty(leg, "Amount", props);
            CopyProperty(leg, "EquityPercentage", props);
            CopyProperty(leg, "SharesTerms", props);
            CopyProperty(leg, "ReturnRate", props);
            CopyProperty(leg, "TermMonths", props);
            CopyProperty(leg, "RepaymentModel", props);
            CopyProperty(leg, "ProfitSharePercentage", props);
            CopyProperty(leg, "ExitTerms", props);

            var legTypeName = legType switch
            {
                1 => "Equity",
                2 => "Loan",
                3 => "ProfitSharing",
                _ => "Unknown"
            };
            CopyPropertyValue(legTypeName, "legTypeName", props);
            CopyPropertyValue(legType, "LegType", props);

            CopyProperty(leg, "TermMonths", "termValueSnapshot", props);
            CopyProperty(leg, "TermMonths", "termValue", props);
            CopyProperty(leg, "TermMonths", "termMonths", props);

            switch ((Domain.Entities.Enums.NegotiationOfferLegType)legType)
            {
                case Domain.Entities.Enums.NegotiationOfferLegType.Equity:
                    CopyProperty(leg, "EquityPercentage", "ownershipPercentage", props);
                    CopyProperty(leg, "EquityPercentage", "proposedSharePercentage", props);
                    CopyProperty(leg, "EquityPercentage", "equityPercentageSnapshot", props);
                    break;

                case Domain.Entities.Enums.NegotiationOfferLegType.Loan:
                    CopyProperty(leg, "ReturnRate", "returnRateSnapshot", props);
                    CopyProperty(leg, "ReturnRate", "interestRate", props);
                    CopyProperty(leg, "RepaymentModel", "repaymentModelSnapshot", props);
                    CopyProperty(leg, "RepaymentModel", "repaymentFrequency", props);
                    break;

                case Domain.Entities.Enums.NegotiationOfferLegType.ProfitSharing:
                    CopyProperty(leg, "ProfitSharePercentage", "profitSharePercentageSnapshot", props);
                    CopyProperty(leg, "ProfitSharePercentage", "profitSharePercentage", props);
                    break;
            }
        }

        CopyPropertyName("Amount", "contributionAmount", props);
        CopyPropertyName("Amount", "requestedAmount", props);
        CopyPropertyName("Amount", "totalAmount", props);

        var json = JsonSerializer.Serialize(props);
        return JsonDocument.Parse(json).RootElement.Clone();
    }

    private static void CopyProperty(JsonElement source, string sourceName, Dictionary<string, JsonElement> target)
    {
        if (source.TryGetProperty(sourceName, out var value) && value.ValueKind != JsonValueKind.Null)
            target.TryAdd(sourceName, value.Clone());
    }

    private static void CopyProperty(JsonElement source, string sourceName, string targetName, Dictionary<string, JsonElement> target)
    {
        if (source.TryGetProperty(sourceName, out var value) && value.ValueKind != JsonValueKind.Null)
            target.TryAdd(targetName, value.Clone());
    }

    private static void CopyPropertyName(string sourceName, string targetName, Dictionary<string, JsonElement> source)
    {
        if (source.TryGetValue(sourceName, out var value))
            source.TryAdd(targetName, value);
    }

    private static void CopyPropertyValue(string value, string targetName, Dictionary<string, JsonElement> target)
    {
        using var doc = JsonDocument.Parse(JsonSerializer.Serialize(value));
        target.TryAdd(targetName, doc.RootElement.Clone());
    }

    private static void CopyPropertyValue(int value, string targetName, Dictionary<string, JsonElement> target)
    {
        using var doc = JsonDocument.Parse(JsonSerializer.Serialize(value));
        target.TryAdd(targetName, doc.RootElement.Clone());
    }
}
