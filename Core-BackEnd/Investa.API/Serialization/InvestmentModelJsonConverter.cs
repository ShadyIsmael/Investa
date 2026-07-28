using System.Text.Json;
using System.Text.Json.Serialization;
using Investa.Domain.Entities.Enums;

namespace Investa.API.Serialization;

/// <summary>
/// Enforces the authoritative public Opportunity API investment-model names.
/// </summary>
public sealed class InvestmentModelJsonConverter : JsonConverter<InvestmentModel>
{
    public override InvestmentModel Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException("InvestmentModel must be a supported API value.");

        return reader.GetString()?.Trim() switch
        {
            "EquityInvestment" => InvestmentModel.Equity,
            "LoanInvestment" => InvestmentModel.LoanInvestment,
            "ProfitSharingInvestment" => InvestmentModel.CapitalContributionProfitSharing,
            _ => throw new JsonException("Unsupported InvestmentModel value.")
        };
    }

    public override void Write(Utf8JsonWriter writer, InvestmentModel value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value switch
        {
            InvestmentModel.Equity => "EquityInvestment",
            InvestmentModel.LoanInvestment => "LoanInvestment",
            InvestmentModel.CapitalContributionProfitSharing => "ProfitSharingInvestment",
            _ => throw new JsonException("Unsupported InvestmentModel value.")
        });
}
