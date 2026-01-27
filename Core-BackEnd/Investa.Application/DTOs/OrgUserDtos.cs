using System;

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
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public Guid? RoleId { get; set; }
    public string? PhoneNumber { get; set; }
}

/// <summary>
/// DTO for updating an organizational user.
/// </summary>
public class UpdateOrgUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public Guid? RoleId { get; set; }
    public bool? Status { get; set; }
    public string? PhoneNumber { get; set; }
}
