using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>Join entity for client category interests backed by the Project Category master.</summary>
public class ClientProjectCategory
{
    public int ClientId { get; set; }
    public int ProjectCategoryId { get; set; }
    [ForeignKey(nameof(ClientId))] public Client? Client { get; set; }
    [ForeignKey(nameof(ProjectCategoryId))] public ProjectCategory? ProjectCategory { get; set; }
}
