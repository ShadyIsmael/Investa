using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class ServicePrice
{
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string ServiceCode { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string ServiceName { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Required]
    [StringLength(10)]
    public string Currency { get; set; } = "Credits";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
