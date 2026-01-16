using System;

namespace Investa.Domain.Entities;

public class UserGroup
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime AssignedAt { get; set; }
}
