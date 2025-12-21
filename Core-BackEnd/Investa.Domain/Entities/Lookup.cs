using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class Lookup
{
    [Key]
    public int Id { get; set; }

    public LookupType Type { get; set; }

    [Required]
    [StringLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Value { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
