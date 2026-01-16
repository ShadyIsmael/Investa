using System;

namespace Investa.Application.DTOs;

public class TimeSeriesPointDto
{
    public DateTime Date { get; set; }
    public decimal Value { get; set; }
}
