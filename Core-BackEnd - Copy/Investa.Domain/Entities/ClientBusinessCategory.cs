using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

/// <summary>
/// Join entity for many-to-many between Client and BusinessCategory
/// </summary>
public class ClientBusinessCategory
{
    public int ClientId { get; set; }
    public int BusinessCategoryId { get; set; }

    [ForeignKey(nameof(ClientId))]
    public Client? Client { get; set; }

    [ForeignKey(nameof(BusinessCategoryId))]
    public BusinessCategory? BusinessCategory { get; set; }
}
