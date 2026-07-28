using Investa.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Investa.Application.Services;

public sealed class ClientInteractionChargingPolicy : IClientInteractionChargingPolicy
{
    public ClientInteractionChargingPolicy(IConfiguration configuration)
    {
        IsEnabled = bool.TryParse(configuration["Features:ClientInteractionChargingEnabled"], out var enabled)
            && enabled;
    }

    public bool IsEnabled { get; }
}
