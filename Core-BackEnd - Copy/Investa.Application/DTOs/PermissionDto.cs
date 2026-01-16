using System;

namespace Investa.Application.DTOs;

public class PermissionDto
{
    public int Id { get; set; }
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
}
