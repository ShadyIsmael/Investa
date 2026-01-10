using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class LookupDto
{
    public int Id { get; set; }
    public LookupType Type { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string ValueAr { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty; // localized or friendly label for frontend
}
