using Investa.Application.Extensions;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

/// <summary>
/// Investment Type metadata for API documentation and frontend consumption.
/// Provides display names and descriptions for each investment type.
/// </summary>
public class InvestmentTypeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Creates an InvestmentTypeDto from an InvestmentType enum value.
    /// </summary>
    public static InvestmentTypeDto FromEnum(InvestmentType type)
    {
        return new InvestmentTypeDto
        {
            Id = (int)type,
            Code = type.GetCode(),
            DisplayName = type.GetDisplayName(),
            Description = type.GetDescription()
        };
    }

    /// <summary>
    /// Gets all available investment types.
    /// </summary>
    public static IEnumerable<InvestmentTypeDto> GetAll()
    {
        return Enum.GetValues<InvestmentType>()
            .Select(FromEnum)
            .ToList();
    }
}
