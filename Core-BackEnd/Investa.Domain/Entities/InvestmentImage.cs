using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class InvestmentImage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvestmentId { get; set; }

    /// <summary>
    /// Type of media asset (CoverImage, Image, Video)
    /// </summary>
    [Required]
    public MediaType MediaType { get; set; } = MediaType.Image;

    [Required]
    [StringLength(500)]
    public string Url { get; set; } = null!;

    /// <summary>
    /// Thumbnail URL for videos or optimized image thumbnails
    /// </summary>
    [StringLength(500)]
    public string? ThumbnailUrl { get; set; }

    /// <summary>
    /// Original file name
    /// </summary>
    [StringLength(255)]
    public string? FileName { get; set; }

    [StringLength(250)]
    public string? Caption { get; set; }

    public int SortOrder { get; set; } = 0;

    public bool IsPrimary { get; set; } = false;

    /// <summary>
    /// User who uploaded this media asset
    /// </summary>
    public Guid? UploadedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(InvestmentId))]
    public Investment Investment { get; set; } = null!;

    [ForeignKey(nameof(UploadedBy))]
    public AuthUser? Uploader { get; set; }
}
