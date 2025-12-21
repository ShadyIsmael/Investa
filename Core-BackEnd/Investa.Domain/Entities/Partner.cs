using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class Partner
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? ContactInfo { get; set; }
}
