using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Linq;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Localization;
using Serilog;
using Investa.API.Middlewares;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Investa.API.Authorization;
using Investa.Application.Common;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Application.Services.Finance;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Services;
using Investa.Infrastructure.Repositories;
using Investa.Infrastructure.Seed;


try
{
    var builder = WebApplication.CreateBuilder(args);

    // Short-circuit full startup when invoked by EF tools to avoid host startup issues (temporary)
    // Set environment variable RUNNING_EF_TOOLS=1 when running EF commands to skip building the host
    if (Environment.GetEnvironmentVariable("RUNNING_EF_TOOLS") == "1")
    {
        Console.WriteLine("[STARTUP] Detected EF tools run. Skipping full application startup.");
        return;
    }

    // === KESTREL CONFIGURATION: Bind to 0.0.0.0 for network accessibility ===
    // Allows access via hostname (DESKTOP-DIH7CQH), IP address, or localhost
    // Use a single configurable backend port for consistency across logs and messaging
    const int backendPort = 5235;
    builder.WebHost.ConfigureKestrel(options =>
    {
        // Bind only to the legacy dev API port to remain compatible with frontend defaults
        // Avoid binding to multiple ports to prevent startup failure if one port is already in use.
        options.ListenAnyIP(backendPort);
        // options.ListenAnyIP(5001, listenOptions => listenOptions.UseHttps()); // Uncomment to enable HTTPS
    });

    // === LOGGING CONFIGURATION ===
    builder.Host.UseSerilog((context, config) =>
    {
        config.ReadFrom.Configuration(context.Configuration)
              .Enrich.FromLogContext()
              .Enrich.WithMachineName()
              .Enrich.WithThreadId();
    });

    var logger = LoggerFactory.Create(x => x.AddConsole()).CreateLogger("Startup");
    logger.LogInformation("🚀 Application startup initiated in {Environment} environment",
        builder.Environment.EnvironmentName);

    Console.WriteLine($"[STARTUP] Environment: {builder.Environment.EnvironmentName}");
    Console.WriteLine($"[STARTUP] Starting configuration...");
    Console.WriteLine($"[STARTUP] Connection String: {builder.Configuration.GetConnectionString("DefaultConnection")?.Substring(0, Math.Min(50, builder.Configuration.GetConnectionString("DefaultConnection")?.Length ?? 0))}...");

    // === DATABASE CONFIGURATION ===
    Console.WriteLine("[STARTUP] Configuring database...");

    if (builder.Environment.IsEnvironment("Testing"))
    {
        // Use in-memory database when running tests to avoid external DB dependency
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseInMemoryDatabase("Investa_TestDB");
        });
        Console.WriteLine("[STARTUP] Using InMemory Database for Testing environment");

        // Add a lightweight test authentication scheme
        builder.Services.AddAuthentication("Test")
            .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, Investa.API.Testing.TestAuthHandler>("Test", o => { });

        // Ensure Fallback policy accepts the Test authentication scheme
        builder.Services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                .AddAuthenticationSchemes("Test")
                .RequireAuthenticatedUser()
                .Build();
        });
    }
    else
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                // Production/local database is SQL Server 2014 (compatibility level 120).
                // Prevent EF from translating captured primitive collections through OPENJSON.
                sqlOptions.UseCompatibilityLevel(120);
                sqlOptions.CommandTimeout(30);
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null);
            }));
        Console.WriteLine("[STARTUP] Database configured successfully");
    }

    // === IDENTITY CONFIGURATION ===
    builder.Services.AddIdentity<Investa.Infrastructure.Identity.ApplicationIdentityUser, Investa.Infrastructure.Identity.ApplicationIdentityRole>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = false;
        options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._+";
        options.SignIn.RequireConfirmedEmail = false;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    // === AUTHENTICATION & AUTHORIZATION ===
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing!");
    var jwtIssuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer is missing!");
    var jwtAudience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience is missing!");

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role
        };

        // JWT Bearer authentication event handlers
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                logger.LogWarning("JWT authentication failed: {Message}", context.Exception?.Message);
                return Task.CompletedTask;
            }
        };
    });

    // === AUTHORIZATION - PERMISSION-BASED ACCESS CONTROL ===
    builder.Services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
    builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

    // === AUTHORIZATION - PROGRESSIVE TRUST LEVEL POLICIES ===
    builder.Services.AddScoped<IAuthorizationHandler, Investa.API.Authorization.TrustLevelAuthorizationHandler>();

    builder.Services.AddAuthorization(options =>
    {
        // Fallback policy requiring authenticated user (no anonymous access by default)
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();

        // Trust-level policies (apply to any endpoint needing progressive gating)
        options.AddPolicy("TrustLevel1", policy =>
            policy.Requirements.Add(new Investa.API.Authorization.TrustLevelRequirement(Investa.Domain.Entities.Enums.TrustLevel.Registered)));

        options.AddPolicy("TrustLevel2", policy =>
            policy.Requirements.Add(new Investa.API.Authorization.TrustLevelRequirement(Investa.Domain.Entities.Enums.TrustLevel.Interactive)));

        options.AddPolicy("TrustLevel3", policy =>
            policy.Requirements.Add(new Investa.API.Authorization.TrustLevelRequirement(Investa.Domain.Entities.Enums.TrustLevel.TrustedActive)));
    });

    // === CORS CONFIGURATION ===
    // Dynamic CORS policy allowing local network discovery without hardcoded IPs
    builder.Services.AddCors(options =>
    {
        // Primary policy: AllowLocalNetwork (Zero-Config Discovery)
        options.AddPolicy("AllowLocalNetwork", policy =>
        {
            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                
                string host;
                try 
                { 
                    host = new Uri(origin).Host; 
                } 
                catch 
                { 
                    return false; 
                }

                // Zero-config local allowance
                if (host == "localhost") return true;
                if (host.EndsWith(".local", StringComparison.OrdinalIgnoreCase)) return true;
                if (host.StartsWith("10.", StringComparison.OrdinalIgnoreCase)) return true;
                if (host.StartsWith("192.168.", StringComparison.OrdinalIgnoreCase)) return true;
                if (host.StartsWith("172.", StringComparison.OrdinalIgnoreCase)) 
                {
                    // Check if it's in the 172.16.0.0 - 172.31.255.255 range
                    var parts = host.Split('.');
                    if (parts.Length >= 2 && int.TryParse(parts[1], out int secondOctet))
                    {
                        return secondOctet >= 16 && secondOctet <= 31;
                    }
                }

                return false;
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });

        // Fallback default policy (for backward compatibility with existing config)
        options.AddDefaultPolicy(policy =>
        {
            var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                ?? new[] { "http://localhost:3000", "http://localhost:5173" };

            var networkConfig = builder.Configuration.GetSection("NetworkConfig");
            var hostName = networkConfig["HostName"] ?? Environment.MachineName;
            var frontendPort = networkConfig["FrontendPort"] ?? "5173";

            var dynamicCorsOrigins = new[]
            {
                $"http://localhost:{frontendPort}",
                $"http://{hostName}:{frontendPort}",
                $"http://{hostName}.local:{frontendPort}"
            };

            corsOrigins = (corsOrigins ?? Array.Empty<string>()).Concat(dynamicCorsOrigins)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            policy.SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                string host;
                try { host = new Uri(origin).Host; } catch { return false; }

                // Zero-config local allowance
                if (host == "localhost") return true;
                if (host.EndsWith(".local", StringComparison.OrdinalIgnoreCase)) return true;
                if (host.StartsWith("10.", StringComparison.OrdinalIgnoreCase)) return true;
                if (host.StartsWith("192.168.", StringComparison.OrdinalIgnoreCase)) return true;

                // Check against configured origins
                return corsOrigins.Any(o => 
                    string.Equals(o, origin, StringComparison.OrdinalIgnoreCase) || 
                    new Uri(o).Host == host);
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });

        // Loose policy without credentials (for public endpoints, if needed)
        options.AddPolicy("AllowAll", policy =>
        {
            policy.SetIsOriginAllowed(origin => true)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    builder.Services.AddHttpClient();
    builder.Services.AddScoped<IFileStorage, Investa.Infrastructure.Services.FileStoreStorage>();
    builder.Services.AddScoped<IHtmlToPdfRenderer, Investa.Infrastructure.Services.PlaywrightHtmlToPdfRenderer>();
    // Register file storage implementation (local by default)

    // === EMAIL CONFIGURATION (Options Pattern) ===
    // Reads email SMTP configuration from: appsettings.json -> Email:{...}
    builder.Services.Configure<Investa.Application.DTOs.EmailOptions>(builder.Configuration.GetSection("Email"));

    // === API CONFIGURATION ===
    builder.Services.AddControllers()

           .AddJsonOptions(options =>
           {
               // Enforce camelCase naming for all JSON responses
               options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
               options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
               options.JsonSerializerOptions.WriteIndented = false;
               options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
           })
           .ConfigureApiBehaviorOptions(options =>
           {
               options.InvalidModelStateResponseFactory = context =>
               {
                   var localizer = context.HttpContext.RequestServices.GetService<IStringLocalizer<Investa.API.Resources.SharedResource>>();
                   var message = localizer?[("ValidationFailed")]?.Value ?? "Validation failed";
                   var errors = context.ModelState.Values.SelectMany(v => v.Errors);
                   return new BadRequestObjectResult(new
                   {
                       success = false,
                       message = message,
                       errors = errors.Select(e => e.ErrorMessage)
                   });
               };
           });

    // === FIREBASE CLOUD MESSAGING CONFIGURATION ===
    // Initialize Firebase Admin SDK for push notifications
    var firebaseConfigPath = builder.Configuration["Firebase:ServiceAccountPath"];
    if (!string.IsNullOrEmpty(firebaseConfigPath) && File.Exists(firebaseConfigPath))
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(firebaseConfigPath)
        });
        logger.LogInformation("✅ Firebase Admin SDK initialized from {Path}", firebaseConfigPath);
    }
    else
    {
        logger.LogWarning("⚠️  Firebase service account file not found. Push notifications will be unavailable.");
        logger.LogWarning("   Configure 'Firebase:ServiceAccountPath' in appsettings.json");
    }

    // === AUTOMATION MAPPER ===
    builder.Services.AddAutoMapper(typeof(Investa.Application.Mappings.MappingProfile).Assembly);

    // === DEVELOPMENT IDENTITY RESEED (repair-only) ===
    builder.Services.AddDevIdentityReseed();
    builder.Services.AddScoped<FinancePermissionBackfillService>();

    // === DEVELOPMENT OPPORTUNITY SEED (repair-only) ===
    if (builder.Environment.IsDevelopment())
    {
        builder.Services.AddDevOpportunitySeed();
    }


    // === APPLICATION SERVICES REGISTRATION ===
    RegisterApplicationServices(builder.Services);

    // === API DOCUMENTATION ===
    builder.Services.AddEndpointsApiExplorer();
    ConfigureSwaggerGeneration(builder.Services);

    // === LOCALIZATION ===
    builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
    builder.Services.AddSingleton<IStringLocalizerFactory, ResourceManagerStringLocalizerFactory>();

    // Register a non-generic IStringLocalizer (used by LookupService)
    builder.Services.AddSingleton<IStringLocalizer>(provider =>
    {
        var factory = provider.GetRequiredService<IStringLocalizerFactory>();
        // Create a localizer for the LookupService type (or use a resources base name)
        return factory.Create(typeof(Investa.Application.Services.LookupService));
    });

    // === HEALTH CHECKS ===
    builder.Services.AddHealthChecks();

    // === BUILD APPLICATION ===
    var app = builder.Build();

    // === COMPATIBILITY BACKFILLS ===
    try
    {
        using var scope = app.Services.CreateScope();
        var backfillContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!app.Environment.IsEnvironment("Testing"))
        {
            await backfillContext.Database.MigrateAsync();
        }

        var financePermissionBackfill = scope.ServiceProvider.GetRequiredService<FinancePermissionBackfillService>();
        var addedFinancePermissions = await financePermissionBackfill.BackfillAsync();
        logger.LogInformation(
            "Company Finance permission backfill added {Count} keys: {Keys}",
            addedFinancePermissions.Count,
            string.Join(", ", addedFinancePermissions));

        var backfill = scope.ServiceProvider.GetRequiredService<InvestmentOpportunityBackfillService>();
        var result = await backfill.BackfillAsync();
        logger.LogInformation(
            "Investment Opportunity compatibility backfill result: scanned={Scanned}, migrated={Migrated}, skipped={Skipped}",
            result.Scanned,
            result.Migrated,
            result.Skipped);

        var categoryBackfill = scope.ServiceProvider.GetRequiredService<OpportunityCategoryBackfillService>();
        var categoryResult = await categoryBackfill.BackfillAsync();
        logger.LogInformation(
            "Opportunity category backfill result: scanned={Scanned}, validBefore={ValidBefore}, updated={Updated}, skipped={Skipped}, categoriesUsed={CategoriesUsed}, errors={Errors}",
            categoryResult.Scanned,
            categoryResult.ValidBeforeFix,
            categoryResult.Updated,
            categoryResult.Skipped,
            string.Join(", ", categoryResult.CategoriesUsed),
            string.Join(" | ", categoryResult.Errors));

        var productFieldsBackfill = scope.ServiceProvider.GetRequiredService<OpportunityProductFieldsBackfillService>();
        var productFieldsResult = await productFieldsBackfill.BackfillAsync();
        logger.LogInformation(
            "Opportunity product fields backfill result: scanned={Scanned}, shortDescriptionPopulated={ShortDescriptionPopulated}, useOfFundsPopulated={UseOfFundsPopulated}, equityOfferedPercentageCalculated={EquityOfferedPercentageCalculated}, skipped={Skipped}, errors={Errors}",
            productFieldsResult.Scanned,
            productFieldsResult.ShortDescriptionPopulated,
            productFieldsResult.UseOfFundsPopulated,
            productFieldsResult.EquityOfferedPercentageCalculated,
            productFieldsResult.Skipped,
            string.Join(" | ", productFieldsResult.Errors));

        if (app.Environment.IsDevelopment())
        {
            var roomDemoDataBackfill = scope.ServiceProvider.GetRequiredService<OpportunityRoomDemoDataBackfillService>();
            var roomDemoDataResult = await roomDemoDataBackfill.BackfillAsync();
            logger.LogInformation(
                "Opportunity room demo data backfill result: scanned={Scanned}, populated={Populated}, timelineEventsCreated={TimelineEventsCreated}, documentsCreated={DocumentsCreated}, mediaCreated={MediaCreated}, joinRequestsCreated={JoinRequestsCreated}, skipped={Skipped}",
                roomDemoDataResult.Scanned,
                roomDemoDataResult.OpportunitiesPopulated,
                roomDemoDataResult.TimelineEventsCreated,
                roomDemoDataResult.DocumentsCreated,
                roomDemoDataResult.MediaCreated,
                roomDemoDataResult.JoinRequestsCreated,
                roomDemoDataResult.Skipped);

            // === DEV-ONLY OPPORTUNITY SEED ===
            var opportunitySeed = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Services.OpportunitySeedService>();
            var seedResult = await opportunitySeed.SeedAsync(seedValue: 20260712);
            logger.LogInformation(
                "✅ Opportunity seed result: inspected={Inspected}, updated={Updated}, equitiesRepaired={EquitiesRepaired}, loansRepaired={LoansRepaired}, profitSharingRepaired={ProfitSharingRepaired}, validationErrors={ValidationErrorCount}",
                seedResult.TotalInspected,
                seedResult.TotalUpdated,
                seedResult.EquitiesRepaired,
                seedResult.LoansRepaired,
                seedResult.ProfitSharingRepaired,
                seedResult.ValidationErrors.Count);

            if (seedResult.Opportunity2028Details != null)
            {
                logger.LogInformation(
                    "📊 Opportunity 2028 final values: Title={Title}, Model={Model}, FundingTarget={FundingTarget}, MinInvestment={MinInvestment}, MaxInvestment={MaxInvestment}, EquityPercent={EquityPercent}, InterestRate={InterestRate}, RepaymentFreq={RepaymentFreq}, FinalDate={FinalDate}, ProfitSharePercent={ProfitSharePercent}",
                    seedResult.Opportunity2028Details.Title,
                    seedResult.Opportunity2028Details.Model,
                    seedResult.Opportunity2028Details.FundingTarget,
                    seedResult.Opportunity2028Details.MinimumInvestment,
                    seedResult.Opportunity2028Details.MaximumInvestment,
                    seedResult.Opportunity2028Details.EquityPercentage,
                    seedResult.Opportunity2028Details.InterestRate,
                    seedResult.Opportunity2028Details.RepaymentFrequency,
                    seedResult.Opportunity2028Details.FinalRepaymentDate,
                    seedResult.Opportunity2028Details.ProfitSharePercentage);
            }

            if (seedResult.ValidationErrors.Any())
            {
                logger.LogWarning(
                    "⚠️  Opportunity seed validation errors: {Errors}",
                    string.Join(" | ", seedResult.ValidationErrors.Take(5)));
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Startup compatibility/data backfill did not complete.");
    }

    // === MIDDLEWARE PIPELINE ===
    // Error handling
    app.UseMiddleware<GlobalExceptionMiddleware>();

    // Logging
    app.UseSerilogRequestLogging();

    // Swagger (development only by default, but available in all for testing)
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Investa API v1");
        options.DocumentTitle = "Investa API Documentation";
        options.DefaultModelsExpandDepth(2);
        options.DefaultModelExpandDepth(2);
    });

    // HTTPS redirect
    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
        app.UseHsts();
    }

    // CORS - UseRouting must be called before UseCors when using endpoint routing
    app.UseRouting();

    // Apply AllowLocalNetwork CORS policy (zero-config for local network discovery)
    app.UseCors("AllowLocalNetwork");

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Request context
    app.UseMiddleware<RequestContextMiddleware>();

    // === ENDPOINT MAPPING ===
    app.MapControllers();
    app.MapHealthChecks("/health").AllowAnonymous();

    // Determine a friendly host name to present in logs (can be overridden via configuration)
    var networkConfig = builder.Configuration.GetSection("NetworkConfig");
    var hostName = networkConfig["HostName"] ?? Environment.MachineName;

    logger.LogInformation("✅ Application configured successfully");
    logger.LogInformation("🖥️  Server: {ServerName}", hostName);
    logger.LogInformation("🌐 Binding: 0.0.0.0:{Port} (Network accessible)", backendPort);
    logger.LogInformation("🔔 Push Notifications: Firebase Cloud Messaging (FCM)");
    logger.LogInformation("🏥 Health: /api/health");

    Console.WriteLine($"[STARTUP] ✅ Configuration complete");
    Console.WriteLine($"[STARTUP] 🖥️  Server: {hostName}");
    Console.WriteLine($"[STARTUP] 🌐 Binding: 0.0.0.0:{backendPort}");
    Console.WriteLine($"[STARTUP] 📡 Access via:");
    Console.WriteLine($"[STARTUP]    - http://localhost:{backendPort}");
    Console.WriteLine($"[STARTUP]    - http://{hostName}:{backendPort}");
    Console.WriteLine($"[STARTUP]    - http://{hostName}.local:{backendPort}");
    Console.WriteLine($"[STARTUP] 🏥 Health: http://{hostName}:{backendPort}/api/health");
    Console.WriteLine($"[STARTUP] Press Ctrl+C to shut down.");

    // === DEVELOPMENT-ONLY: Safe dev reseed (repair-only) for identity roles & admin mapping ===
    if (app.Environment.IsDevelopment())
    {
        using var scope = app.Services.CreateScope();
        var reseed = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Seed.DevIdentityReseedService>();
        await reseed.RepairDevelopmentIdentityDataAsync(builder.Configuration);
    }

    await app.RunAsync();

    
    Console.WriteLine("[SHUTDOWN] Application stopped gracefully.");
}
catch (Exception ex)
{
    Console.WriteLine($"[FATAL ERROR] Application terminated unexpectedly:");
    Console.WriteLine($"[FATAL ERROR] Message: {ex.Message}");
    Console.WriteLine($"[FATAL ERROR] Type: {ex.GetType().Name}");
    Console.WriteLine($"[FATAL ERROR] Stack Trace:\n{ex.StackTrace}");
    if (ex.InnerException != null)
    {
        Console.WriteLine($"[FATAL ERROR] Inner Exception: {ex.InnerException.Message}");
        Console.WriteLine($"[FATAL ERROR] Inner Stack Trace:\n{ex.InnerException.StackTrace}");
    }
    Log.Fatal(ex, "💥 Application terminated unexpectedly");
    throw; // Re-throw to ensure non-zero exit code
}
finally
{
    Console.WriteLine("[SHUTDOWN] Flushing logs...");
    Log.CloseAndFlush();
}

/// <summary>
/// Registers all application, infrastructure, and domain services with proper lifetimes
/// Clean Architecture: Services organized by layer and responsibility
/// </summary>
static void RegisterApplicationServices(IServiceCollection services)
{
    services.AddHttpContextAccessor();
    services.AddScoped<ICurrentUserContext, Investa.API.Services.HttpCurrentUserContext>();
    // === INFRASTRUCTURE LAYER ===
    // Unit of Work & Repository Pattern (Scoped - per request)
    services.AddScoped<IUnitOfWork, UnitOfWork>();
    services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
    services.AddScoped<IEffectivePermissionService, EffectivePermissionService>();
    
    // Specialized repositories with complex query support
    services.AddScoped<IInvestmentRepository, InvestmentRepository>();
    services.AddScoped<IFinanceRepository, FinanceRepository>();

    // === APPLICATION LAYER - Business Services (Scoped - per request) ===
    services.AddScoped<IProfileService, ProfileService>();
    services.AddScoped<ICategoryService, CategoryService>();
    services.AddScoped<IClientService, ClientService>();
    services.AddScoped<IOrgUserService, Investa.Infrastructure.Services.OrgUserService>();
    services.AddScoped<IInvestmentService, InvestmentService>();
    services.AddScoped<IInvestmentEventService, InvestmentEventService>();
    services.AddScoped<ILookupService, LookupService>();
    services.AddScoped<IInvestmentRequestService, InvestmentRequestService>();
    services.AddScoped<IInvestmentAnalyticsService, InvestmentAnalyticsService>();
    services.AddScoped<IScoreService, ScoreService>();
    services.AddScoped<ITrustService, TrustService>();
    services.AddScoped<IReputationService, ReputationService>();
    services.AddScoped<ICreditService, CreditService>();
    services.AddScoped<IWalletService, WalletService>();
    services.AddScoped<IPriceService, PriceService>();
    services.AddScoped<IPaidActionService, PaidActionService>();
    services.AddScoped<IReportService, ReportService>();
    services.AddScoped<IOpportunityService, OpportunityService>();
    services.AddScoped<IInvestmentContractService, InvestmentContractService>();
    services.AddScoped<INegotiationService, NegotiationService>();
    services.AddScoped<InvestmentOpportunityBackfillService>();
    services.AddScoped<OpportunityCategoryBackfillService>();
    services.AddScoped<OpportunityProductFieldsBackfillService>();
    services.AddScoped<OpportunityRoomDemoDataBackfillService>();
    services.AddScoped<IChatService, ChatService>();
    services.AddScoped<IGroupService, GroupService>();
    services.AddScoped<IFinanceValidationService, FinanceValidationService>();
    services.AddScoped<IFinanceAccountingService, FinanceAccountingService>();
    services.AddScoped<IFinanceTransactionService, FinanceTransactionService>();
    services.AddScoped<IFinanceMasterDataService, FinanceMasterDataService>();
    services.AddScoped<IFinanceOverviewService, FinanceOverviewService>();
    services.AddScoped<IFinanceReconciliationService, FinanceReconciliationService>();

    // === INFRASTRUCTURE LAYER - External Services ===
    // Security Services (Scoped - stateful per request)
    services.AddScoped<ICryptoService, AesGcmCryptoService>();
    services.AddScoped<IKeyManagementService, LocalKeyManagementService>();
    services.AddScoped<IJwtTokenService, JwtTokenService>();
    
    // Communication Services (Scoped)
    services.AddScoped<ISmsSender, SmsSender>();
    services.AddScoped<Investa.Application.Interfaces.IEmailService, Investa.Infrastructure.Services.GmailSmtpEmailService>();



    // === APPLICATION LAYER - Singleton Services ===
    // Admin Availability (Singleton - shared state across all requests)
    services.AddSingleton<IAdminAvailabilityService, AdminAvailabilityService>();

    // === INFRASTRUCTURE LAYER - Notification Services ===
    // Firebase Cloud Messaging for push notifications (Scoped)
    services.AddScoped<INotificationService, NotificationService>();

    // === PRESENTATION LAYER - Request Context (Scoped) ===
    services.AddScoped<RequestContext>();
}

/// <summary>
/// Configures Swagger/OpenAPI documentation generation
/// </summary>
static void ConfigureSwaggerGeneration(IServiceCollection services)
{
    services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Investa Investment Platform API",
            Version = "v1.0.0",
            Description = "RESTful API for the Investa investment platform with real-time chat and notifications",
            Contact = new OpenApiContact
            {
                Name = "Investa Development Team",
                Email = "dev@investa.local"
            },
            License = new OpenApiLicense
            {
                Name = "Proprietary",
                Url = new Uri("https://investa.local/license")
            }
        });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            Description = "Enter 'Bearer' followed by a valid JWT token. Example: Bearer eyJhbGc..."
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                new string[] {}
            }
        });

        // Use full type name as schema ID to avoid conflicts between DTOs with the same name in different namespaces
        options.CustomSchemaIds(type => type.FullName);

        // XML comments support (if documentation is available)
        var xmlFile = Path.Combine(AppContext.BaseDirectory, "Investa.API.xml");
        if (File.Exists(xmlFile))
        {
            options.IncludeXmlComments(xmlFile);
        }
    });
}
