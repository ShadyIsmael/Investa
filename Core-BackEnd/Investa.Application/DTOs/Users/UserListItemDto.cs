using System;

namespace Investa.Application.DTOs.Users
{
    public class UserListItemDto
    {
        public Guid Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Role { get; set; }
        public Guid? RoleId { get; set; }
        public string? GroupName { get; set; }
        public int? GroupId { get; set; }
        public string? RoleName { get; set; }
        public string? Status { get; set; }
        public DateTime? LastLogin { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? Avatar { get; set; }
        public object? Metadata { get; set; }
    }
}