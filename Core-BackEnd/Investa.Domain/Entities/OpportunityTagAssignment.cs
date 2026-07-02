namespace Investa.Domain.Entities;

public class OpportunityTagAssignment
{
    public int OpportunityId { get; set; }
    public Opportunity Opportunity { get; set; } = null!;

    public int OpportunityTagId { get; set; }
    public OpportunityTag OpportunityTag { get; set; } = null!;
}
