using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Services.Firebase;

public sealed class FirebaseInitializer
{
    private readonly Investa.Application.DTOs.FirebaseOptions _options;
    private readonly ILogger<FirebaseInitializer> _logger;

    public FirebaseInitializer(
        IOptions<Investa.Application.DTOs.FirebaseOptions> options,
        ILogger<FirebaseInitializer> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public void Initialize()
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("Firebase is disabled. Skipping initialization.");
            return;
        }

        if (FirebaseApp.DefaultInstance != null)
        {
            _logger.LogInformation("FirebaseApp already initialized.");
            return;
        }

        if (string.IsNullOrWhiteSpace(_options.ProjectId))
        {
            throw new InvalidOperationException(
                "Firebase is enabled but ProjectId is not configured. Set 'Firebase:ProjectId' in configuration.");
        }

        if (string.IsNullOrWhiteSpace(_options.CredentialsPath) || !File.Exists(_options.CredentialsPath))
        {
            throw new InvalidOperationException(
                $"Firebase is enabled but credentials file not found at '{_options.CredentialsPath}'. " +
                "Set 'Firebase:CredentialsPath' or the GOOGLE_APPLICATION_CREDENTIALS environment variable.");
        }

        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(_options.CredentialsPath),
            ProjectId = _options.ProjectId
        });

        _logger.LogInformation("FirebaseApp initialized. Project: {ProjectId}", _options.ProjectId);
    }
}