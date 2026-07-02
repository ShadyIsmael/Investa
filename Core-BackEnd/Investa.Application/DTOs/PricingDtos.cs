using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public class ServicePriceDto
{
    public int Id { get; set; }
    public string ServiceCode { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateServicePriceRequest
{
    [Required]
    [Range(0, double.MaxValue, ErrorMessage = "Price must be zero or greater.")]
    public decimal Price { get; set; }

    [StringLength(200)]
    public string? ServiceName { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }
}
