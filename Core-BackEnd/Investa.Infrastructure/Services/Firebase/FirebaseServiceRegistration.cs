using Investa.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Investa.Infrastructure.Services.Firebase;

public static class FirebaseServiceRegistration
{
    public static IServiceCollection AddFirebaseServices(this IServiceCollection services)
    {
        services.AddSingleton<FirebaseInitializer>();

        services.AddScoped<IFirebaseCustomTokenService>(sp =>
        {
            var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<Investa.Application.DTOs.FirebaseOptions>>();
            if (!options.Value.Enabled)
                return new NoopFirebaseCustomTokenService();
            return ActivatorUtilities.CreateInstance<FirebaseCustomTokenService>(sp);
        });

        services.AddScoped<IRealtimeEventPublisher>(sp =>
        {
            var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<Investa.Application.DTOs.FirebaseOptions>>();
            if (!options.Value.Enabled)
                return new NoopRealtimeEventPublisher();
            return ActivatorUtilities.CreateInstance<FirebaseRealtimeEventPublisher>(sp);
        });

        services.AddScoped<IFirebasePushSender>(sp =>
        {
            var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<Investa.Application.DTOs.FirebaseOptions>>();
            if (!options.Value.Enabled)
                return new NoopFirebasePushSender();
            return ActivatorUtilities.CreateInstance<FirebasePushSender>(sp);
        });

        services.AddHealthChecks()
            .AddCheck<FirebaseHealthCheck>("firebase", failureStatus: HealthStatus.Degraded);

        return services;
    }
}