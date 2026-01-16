using System;

namespace Investa.Application.DTOs;

public class TopClientDto
{
    public string Name { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public decimal Score { get; set; }
}
