namespace Investa.Application.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string ValueAr { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public string Slug { get; set; } = string.Empty;
}
