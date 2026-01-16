using System;

namespace Investa.Domain.Entities.Security;

/// <summary>
/// Tracks user sessions and refresh tokens for secure token management
/// </summary>
public class UserSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    /// <summary>
    /// Hashed refresh token for secure storage
    /// </summary>
    public string RefreshTokenHash { get; set; } = null!;
    
    /// <summary>
    /// Device fingerprint for binding token to specific device
    /// </summary>
    public string? DeviceFingerprint { get; set; }
    
    /// <summary>
    /// User agent string from request
    /// </summary>
    public string? UserAgent { get; set; }
    
    /// <summary>
    /// IP address from which session was created
    /// </summary>
    public string IpAddress { get; set; } = null!;
    
    /// <summary>
    /// Geo-location data (city, country) for security monitoring
    /// </summary>
    public string? Location { get; set; }
    
    /// <summary>
    /// When the session was created
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// When the refresh token expires
    /// </summary>
    public DateTime ExpiresAt { get; set; }
    
    /// <summary>
    /// When the session was last used (for activity tracking)
    /// </summary>
    public DateTime? LastUsedAt { get; set; }
    
    /// <summary>
    /// Whether the session was explicitly revoked
    /// </summary>
    public bool IsRevoked { get; set; }
    
    /// <summary>
    /// When and why the session was revoked
    /// </summary>
    public DateTime? RevokedAt { get; set; }
    public string? RevocationReason { get; set; }
    
    // Navigation
    public AuthUser User { get; set; } = null!;
}
