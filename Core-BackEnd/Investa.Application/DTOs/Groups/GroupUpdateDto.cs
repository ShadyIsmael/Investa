using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs.Groups
{
    public class GroupUpdateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentGroupId { get; set; }
        public bool IsActive { get; set; } = true;
        public object? Metadata { get; set; }
    }
}