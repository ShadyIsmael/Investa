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
