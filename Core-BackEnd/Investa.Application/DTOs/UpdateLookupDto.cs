using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class UpdateLookupDto
{
    public LookupType Type { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
