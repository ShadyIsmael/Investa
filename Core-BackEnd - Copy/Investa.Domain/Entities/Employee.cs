using System;
using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class Employee
{
    [Key]
    public int Id { get; set; }

    [Required]
    public Guid UserId { get; set; }

    [Required]
    [StringLength(50)]
    public string EmployeeNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Department { get; set; }

    public byte PermissionsLevel { get; set; } = 1;

    public DateTime? HireDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public AuthUser? User { get; set; }
}
