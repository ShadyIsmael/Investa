using System;

namespace Investa.Application.DTOs;

public class MonthlyCreditSumDto
{
    // month number (1..12)
    public int Id { get; set; }

    // summed positive credit amount for the month
    public decimal Amount { get; set; }

    // month name, e.g. "March"
    public string Month { get; set; } = string.Empty;
}
