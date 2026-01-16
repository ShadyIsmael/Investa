using System;
using System.Collections.Generic;

namespace Investa.Application.DTOs.Groups
{
    public class MemberSampleDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
    }

    public class GroupListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public int? ParentGroupId { get; set; }
        public int MemberCount { get; set; }
        public IEnumerable<MemberSampleDto> MembersSample { get; set; } = Array.Empty<MemberSampleDto>();
        public IEnumerable<string> Permissions { get; set; } = Array.Empty<string>();
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public object? Metadata { get; set; }
    }
}