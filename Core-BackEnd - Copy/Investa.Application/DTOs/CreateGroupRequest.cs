namespace Investa.Application.DTOs;

public class CreateGroupRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
