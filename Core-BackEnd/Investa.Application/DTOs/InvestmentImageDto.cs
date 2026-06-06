using System;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public class InvestmentImageDto
{
    public int Id { get; set; }
    public string Url { get; set; } = null!;
    public string? ThumbnailUrl { get; set; }
    public string? FileName { get; set; }
    public string? Caption { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }
    public Guid? UploadedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public MediaType MediaType { get; set; } = MediaType.Image;
}
