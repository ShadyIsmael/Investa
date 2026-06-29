namespace Investa.Application.DTOs.Trust;

public class ReputationRuleDto
{
    public int Id { get; set; }
    public string RuleCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Points { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsSystem { get; set; }
    public bool IsAutomatic { get; set; }
    public bool CanRepeat { get; set; }
    public int MaximumOccurrences { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateReputationRuleRequest
{
    public string RuleCode { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Points { get; set; }
    public int SortOrder { get; set; }
    public bool CanRepeat { get; set; }
    public int MaximumOccurrences { get; set; }
    public bool IsAutomatic { get; set; } = true;
}

public class UpdateReputationRuleRequest
{
    public string Description { get; set; } = string.Empty;
    public int Points { get; set; }
    public bool IsEnabled { get; set; }
    public int SortOrder { get; set; }
    public bool CanRepeat { get; set; }
    public int MaximumOccurrences { get; set; }
}