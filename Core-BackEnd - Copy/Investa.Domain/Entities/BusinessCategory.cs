using System;

namespace Investa.Domain.Entities;

public class BusinessCategory
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string ValueAr { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation for client categories
    public ICollection<ClientBusinessCategory> ClientBusinessCategories { get; set; } = new List<ClientBusinessCategory>();
}
