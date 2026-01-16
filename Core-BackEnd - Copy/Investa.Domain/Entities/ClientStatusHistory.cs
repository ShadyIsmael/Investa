using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class ClientStatusHistory
{
    [Key]
    public int Id { get; set; }

    // FK to Client
    public int ClientId { get; set; }
    public Client? Client { get; set; }

    // old and new status ids
    public int? OldStatusId { get; set; }
    public int NewStatusId { get; set; }

    [StringLength(1000)]
    public string? Reason { get; set; }

    // Admin who changed the status (AuthUser Id as GUID)
    public Guid ChangedByAdminId { get; set; }

    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}
