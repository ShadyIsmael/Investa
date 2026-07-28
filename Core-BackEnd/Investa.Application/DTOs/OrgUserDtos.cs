using System;
using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

/// <summary>
/// Basic DTO for organizational user listing (lightweight).
/// </summary>
public class OrgUserBasicDto
{
    public Guid Id { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public int AccessLevel { get; set; }
    public bool Status { get; set; }
}

/// <summary>
/// DTO for creating a new organizational user.
/// </summary>
public class CreateOrgUserDto
{
    [Required, EmailAddress, StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 1)]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? LastName { get; set; }
    public Guid? RoleId { get; set; }

    [Phone, StringLength(20)]
    public string? PhoneNumber { get; set; }
}

/// <summary>
/// DTO for updating an organizational user.
/// </summary>
public class UpdateOrgUserDto
{
    [StringLength(100, MinimumLength = 1)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [EmailAddress, StringLength(256)]
    public string? Email { get; set; }
    public Guid? RoleId { get; set; }
    public bool? Status { get; set; }

    [Phone, StringLength(20)]
    public string? PhoneNumber { get; set; }
}

public class OrgUserDetailDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; }
    public Guid? RoleId { get; set; }
    public string? GroupName { get; set; }
    public int? GroupId { get; set; }
    public string? RoleName { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsLocked { get; set; }
    public DateTime? LockoutEnd { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Avatar { get; set; }
    public List<string> Groups { get; set; } = new();
    public List<string> Roles { get; set; } = new();
    public List<string> EffectivePermissions { get; set; } = new();
}

public class LockUserDto
{
    public string? Reason { get; set; }
}

public class UnlockUserDto
{
    public string? Reason { get; set; }
}

public class ResetPasswordDto
{
    [Required]
    public string NewPassword { get; set; } = string.Empty;
}

public class InviteUserDto
{
    public string? Message { get; set; }
}

public class AuditLogEntryDto
{
    public long Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Changes { get; set; }
    public string? PerformedBy { get; set; }
    public DateTime Timestamp { get; set; }
}
