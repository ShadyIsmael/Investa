namespace Investa.Domain.Entities;

public class DeviceToken
{
    public long Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public string? DeviceId { get; set; }

    public string? Browser { get; set; }

    public string? Platform { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastUsedAt { get; set; }
}