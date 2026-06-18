namespace Investa.Application.DTOs.Analytics;

/// <summary>
/// Conversion funnel metrics
/// </summary>
public class ConversionFunnelDto
{
    public int Views { get; set; }
    public int UniqueViews { get; set; }
    public int LearnMore { get; set; }
    public int UniqueLearnMore { get; set; }
    public int Requests { get; set; }
    public int Approvals { get; set; }
    public int Chats { get; set; }
}
