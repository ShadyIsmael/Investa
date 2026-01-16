namespace Investa.Application.DTOs;

public class UpdateCategoryDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string ValueAr { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
