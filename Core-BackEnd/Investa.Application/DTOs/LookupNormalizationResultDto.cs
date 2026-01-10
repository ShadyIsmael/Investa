namespace Investa.Application.DTOs;

public class LookupNormalizationResultDto
{
    public int LookupsTotal { get; set; }
    public int LookupsFixed { get; set; }
    public int BusinessCategoriesTotal { get; set; }
    public int BusinessCategoriesFixed { get; set; }
    public int ClientStatusesTotal { get; set; }
    public int ClientStatusesFixed { get; set; }
}
