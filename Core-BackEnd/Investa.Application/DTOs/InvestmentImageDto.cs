using System;

namespace Investa.Application.DTOs;

public class InvestmentImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = null!;
    public string? Caption { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; }
}