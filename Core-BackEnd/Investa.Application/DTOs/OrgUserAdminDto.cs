using System;

namespace Investa.Application.DTOs;

public class OrgUserAdminDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Role { get; set; }
    public Guid? RoleId { get; set; }
    public string? GroupName { get; set; }
    public int? GroupId { get; set; }
    public string? RoleName { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Avatar { get; set; }
    public object? Metadata { get; set; }
}
