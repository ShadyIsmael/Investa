using System;
using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class RefreshToken
{
    [Key]
    public Guid Id { get; set; }

    public Guid AuthUserId { get; set; }

    [Required]
    [StringLength(512)]
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool Revoked { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public AuthUser? AuthUser { get; set; }
}