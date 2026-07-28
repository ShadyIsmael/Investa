using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public class RegisterDeviceTokenRequestDto
{
    [Required]
    [MaxLength(500)]
    public string Token { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? DeviceId { get; set; }

    [MaxLength(100)]
    public string? Browser { get; set; }

    [MaxLength(50)]
    public string? Platform { get; set; }
}

public class DeviceTokenResponseDto
{
    public long Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string? DeviceId { get; set; }
    public string? Browser { get; set; }
    public string? Platform { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
}