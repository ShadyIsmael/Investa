using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Investa.API.Serialization;
using System.Linq;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Serilog;
using Investa.API.Middlewares;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Investa.API.Authorization;
using Investa.API.Configuration;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Investa.Application.Services.Finance;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Services;
using Investa.Infrastructure.Repositories;
using Investa.Infrastructure.Seed;
using Investa.Infrastructure.Services.Firebase;
using Investa.API.Health;


try
{
    var builder = WebApplication.CreateBuilder(args);
    var skipStartupDataMutationValue = builder.Configuration["FOPX_SKIP_STARTUP_DATA_MUTATIONS"];
    var skipStartupDataMutations = string.Equals(skipStartupDataMutationValue, "1", StringComparison.OrdinalIgnoreCase)
        || string.Equals(skipStartupDataMutationValue, "true", StringComparison.OrdinalIgnoreCase);
    var demoDataSeedingEnabled = builder.Configuration.GetValue<bool>("FOPX_ENABLE_DEMO_DATA_SEEDING");
    var maySeedDemoData = DemoDataSeedingPolicy.ShouldSeed(
        builder.Environment.EnvironmentName,
        demoDataSeedingEnabled,
        skipStartupDataMutations);

    // Short-circuit full startup when invoked by EF tools to avoid host startup issues (temporary)
    // Set environment variable RUNNING_EF_TOOLS=1 when running EF commands to skip building the host
    if (Environment.GetEnvironmentVariable("RUNNING_EF_TOOLS") == "1")
    {
        Console.WriteLine("[STARTUP] Detected EF tools run. Skipping full application startup.");
        return;
    }

    // === SERVER URL CONFIGURATION: keep one authoritative binding ===
    // The application owns the development URL. launchSettings must not also set
    // ASPNETCORE_URLS, otherwise Kestrel receives the same endpoint twice.
    // This preserves the intended port while allowing UAT-safe loopback binding.
    const int backendPort = 5235;
    var apiBindAddress = skipStartupDataMutations
        ? System.Net.IPAddress.Loopback
        : System.Net.IPAddress.Any;
    var apiBindAddressText = skipStartupDataMutations ? "127.0.0.1" : "0.0.0.0";
    builder.WebHost.UseUrls($"http://{apiBindAddressText}:{backendPort}");

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
    var jwtKey = StartupSecurityConfiguration.RequireJwtSigningKey(builder.Configuration);
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
    // Development allows only the explicitly supported local portal origins.
    // UAT/Production are exact-origin allowlists from Cors:AllowedOrigins.
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ApiCors", policy =>
        {
            var origins = CorsConfiguration.GetAllowedOrigins(builder.Configuration, builder.Environment.EnvironmentName);
            if (origins.Length > 0)
                policy.WithOrigins(origins);
            else
                policy.SetIsOriginAllowed(_ => false);

            policy.AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    StartupSecurityConfiguration.ValidateActiveFileStore(
        builder.Configuration,
        builder.Configuration.GetValue<bool?>("FileStore:Required"));

    builder.Services.AddHttpClient();
    builder.Services.AddScoped<IFileStorage, Investa.Infrastructure.Services.FileStoreStorage>();
    builder.Services.AddScoped<IHtmlToPdfRenderer, Investa.Infrastructure.Services.PlaywrightHtmlToPdfRenderer>();
    // Register file storage implementation (local by default)

    // === EMAIL CONFIGURATION (Options Pattern) ===
    // Reads email SMTP configuration from: appsettings.json -> Email:{...}
    builder.Services
        .AddOptions<Investa.Application.DTOs.EmailOptions>()
        .Bind(builder.Configuration.GetSection("Email"))
        .Validate(
            options => !string.Equals(options.Provider, "MailerSend", StringComparison.OrdinalIgnoreCase)
                || !string.IsNullOrWhiteSpace(options.MailerSend.ApiKey),
            "Email:MailerSend:ApiKey must be configured when Email:Provider is MailerSend.")
        .ValidateOnStart();

    // === API CONFIGURATION ===
    builder.Services.AddControllers()

           .AddJsonOptions(options =>
           {
               // Enforce camelCase naming for all JSON responses
               options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
               options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
               options.JsonSerializerOptions.WriteIndented = false;
               options.JsonSerializerOptions.Converters.Add(new InvestmentModelJsonConverter());
               options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
           })
           .ConfigureApiBehaviorOptions(options =>
           {
            options.InvalidModelStateResponseFactory = context =>
                {
                    var localizer = context.HttpContext.RequestServices.GetService<IStringLocalizer<Investa.API.Resources.SharedResource>>();
                    var message = localizer?[("ValidationFailed")]?.Value ?? "Validation failed";
                    var errors = context.ModelState.Values.SelectMany(v => v.Errors);
                    var fieldErrors = context.ModelState
                        .Where(pair => pair.Value?.Errors.Count > 0)
                        .ToDictionary(
                            pair => pair.Key,
                            pair => pair.Value!.Errors.Select(error => error.ErrorMessage).ToArray());
                    return new BadRequestObjectResult(new
                    {
                        success = false,
                        code = "INVALID_REQUEST",
                        message = message,
                        errors = errors.Select(e => e.ErrorMessage),
                        data = fieldErrors
                    });
                };
           });

    // === FIREBASE CONFIGURATION ===
    // Use strongly-typed options with environment variable fallback
    builder.Services.Configure<Investa.Application.DTOs.FirebaseOptions>(builder.Configuration.GetSection("Firebase"));

    var firebaseSection = builder.Configuration.GetSection("Firebase");
    var fbEnabled = firebaseSection["Enabled"] ?? "false";
    if (!bool.TryParse(fbEnabled, out var isFirebaseEnabled))
        isFirebaseEnabled = false;

    // Resolve credentials path: environment variable > config value
    var credentialsPath = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS")
                          ?? firebaseSection["CredentialsPath"];

    if (builder.Environment.IsEnvironment("Testing"))
    {
        isFirebaseEnabled = false;
        logger.LogInformation("Firebase is disabled for the Testing environment.");
    }

    if (isFirebaseEnabled && FirebaseApp.DefaultInstance != null)
    {
        logger.LogInformation("Firebase Admin SDK is already initialized.");
    }
    else if (isFirebaseEnabled && !string.IsNullOrEmpty(credentialsPath) && File.Exists(credentialsPath))
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.FromFile(credentialsPath),
            ProjectId = firebaseSection["ProjectId"]
        });
        logger.LogInformation("✅ Firebase Admin SDK initialized. Project: {ProjectId}", firebaseSection["ProjectId"]);
    }
    else if (isFirebaseEnabled)
    {
        var error = "Firebase is enabled but configuration is invalid. " +
                    "Set GOOGLE_APPLICATION_CREDENTIALS environment variable to point to your service account JSON, " +
                    "or configure Firebase:CredentialsPath in appsettings.";
        logger.LogError("❌ {Error}", error);

        if (builder.Environment.IsDevelopment())
        {
            throw new InvalidOperationException(error);
        }

        logger.LogWarning("⚠️  Firebase enabled but misconfigured. Continuing without Firebase in non-Development.");
    }
    else
    {
        logger.LogInformation("ℹ️  Firebase is disabled. Firebase-dependent features will use no-op implementations.");
    }

    // === AUTOMATION MAPPER ===
    builder.Services.AddAutoMapper(_ => { }, typeof(Investa.Application.Mappings.MappingProfile).Assembly);

    // === DEVELOPMENT IDENTITY RESEED (repair-only) ===
    builder.Services.AddDevIdentityReseed();
    builder.Services.AddScoped<FinancePermissionBackfillService>();
    builder.Services.AddScoped<OpportunityPermissionBackfillService>();
    builder.Services.AddScoped<CompanyCustomerPermissionBackfillService>();
    builder.Services.AddScoped<CompanyCatalogPermissionBackfillService>();
    builder.Services.AddScoped<CompanySalesOpportunityPermissionBackfillService>();
    builder.Services.AddScoped<CompanyQuotationPermissionBackfillService>();
    builder.Services.AddScoped<CompanyContractPermissionBackfillService>();

    // === DEMO DATA SEEDING (runs on startup) ===
    builder.Services.AddDatabaseSeeder();


    // === DEVELOPMENT OPPORTUNITY SEED (repair-only) ===
    if (maySeedDemoData)
    {
        builder.Services.AddDevOpportunitySeed();
    }


    // === APPLICATION SERVICES REGISTRATION ===
    RegisterApplicationServices(builder.Services, skipStartupDataMutations);

    // === API DOCUMENTATION ===
    builder.Services.AddEndpointsApiExplorer();
    ConfigureSwaggerGeneration(builder.Services);

    // === LOCALIZATION ===
    builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
    builder.Services.AddSingleton<IStringLocalizerFactory, ResourceManagerStringLocalizerFactory>();

    // === HEALTH CHECKS ===
    var fileStoreRequired = builder.Configuration.GetValue<bool?>("FileStore:Required")
        ?? !builder.Environment.IsDevelopment();

    builder.Services.AddHealthChecks()
        .AddCheck<DatabaseHealthCheck>(
            "database",
            failureStatus: HealthStatus.Unhealthy,
            tags: new[] { "dependency", "readiness" })
        .AddCheck<Investa.Infrastructure.Services.FileStoreHealthCheck>(
            "filestore",
            failureStatus: HealthStatus.Degraded,
            tags: new[] { "dependency", "readiness" });

    // === FIREBASE SERVICES ===
    builder.Services.AddFirebaseServices();

    // === BUILD APPLICATION ===
    var app = builder.Build();
    if (skipStartupDataMutations)
    {
        logger.LogWarning("FOPX_SKIP_STARTUP_DATA_MUTATIONS is enabled; startup backfills and seeders are disabled.");
    }

    // === COMPATIBILITY BACKFILLS ===
    try
    {
        using var scope = app.Services.CreateScope();
        var backfillContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (!app.Environment.IsEnvironment("Testing"))
        {
            // Migrations must be applied explicitly via `dotnet ef database update` or by setting AUTO_MIGRATE=1.
            // Normal API startup validates DB compatibility without applying arbitrary pending migrations.
            var autoMigrate = Environment.GetEnvironmentVariable("AUTO_MIGRATE") == "1" && !skipStartupDataMutations;
            if (autoMigrate)
            {
                logger.LogWarning("AUTO_MIGRATE is enabled — applying pending migrations on startup.");
                await backfillContext.Database.MigrateAsync();
            }
            else
            {
                var pendingMigrations = await backfillContext.Database.GetPendingMigrationsAsync();
                var pendingList = pendingMigrations.ToList();
                if (pendingList.Count > 0)
                {
                    logger.LogCritical(
                        "DATABASE COMPATIBILITY MISMATCH: {Count} pending migration(s) detected: {Migrations}. " +
                        "Apply them explicitly with `dotnet ef database update` or set AUTO_MIGRATE=1 to auto-apply on startup.",
                        pendingList.Count,
                        string.Join(", ", pendingList));
                    throw new InvalidOperationException(
                        $"InvestaDb has {pendingList.Count} pending migration(s): {string.Join(", ", pendingList)}. " +
                        "Apply them explicitly or set AUTO_MIGRATE=1.");
                }

                logger.LogInformation("Database schema is up-to-date. No pending migrations detected.");
            }
        }

        if (!skipStartupDataMutations)
        {
            var financePermissionBackfill = scope.ServiceProvider.GetRequiredService<FinancePermissionBackfillService>();
            var addedFinancePermissions = await financePermissionBackfill.BackfillAsync();
            logger.LogInformation(
                "Company Finance permission backfill added {Count} keys: {Keys}",
                addedFinancePermissions.Count,
                string.Join(", ", addedFinancePermissions));

            var opportunityPermissionBackfill = scope.ServiceProvider.GetRequiredService<OpportunityPermissionBackfillService>();
            var opportunityPermissionResult = await opportunityPermissionBackfill.BackfillAsync();
            logger.LogInformation(
                "FOPX Opportunity permission migration added {Count} keys, processed {ReviewerRoles} Reviewer roles, added {ReviewerAssignments} explicit View/Review assignments, and removed {LegacyManageAssignments} legacy Manage assignments: {Keys}",
                opportunityPermissionResult.AddedPermissionKeys.Count,
                opportunityPermissionResult.ReviewerRolesProcessed,
                opportunityPermissionResult.ReviewerAssignmentsAdded,
                opportunityPermissionResult.LegacyManageAssignmentsRemoved,
                string.Join(", ", opportunityPermissionResult.AddedPermissionKeys));

            var companyCustomerPermissionBackfill = scope.ServiceProvider.GetRequiredService<CompanyCustomerPermissionBackfillService>();
            var addedCompanyCustomerPermissions = await companyCustomerPermissionBackfill.BackfillAsync();
            logger.LogInformation(
                "Company Customer permission backfill added {Count} keys: {Keys}",
                addedCompanyCustomerPermissions.Count,
                string.Join(", ", addedCompanyCustomerPermissions));

            var companyCatalogPermissionBackfill = scope.ServiceProvider.GetRequiredService<CompanyCatalogPermissionBackfillService>();
            var addedCompanyCatalogPermissions = await companyCatalogPermissionBackfill.BackfillAsync();
            logger.LogInformation(
                "Company Catalog permission backfill added {Count} keys: {Keys}",
                addedCompanyCatalogPermissions.Count,
                string.Join(", ", addedCompanyCatalogPermissions));

            var companySalesOpportunityPermissionBackfill = scope.ServiceProvider.GetRequiredService<CompanySalesOpportunityPermissionBackfillService>();
            var addedCompanySalesOpportunityPermissions = await companySalesOpportunityPermissionBackfill.BackfillAsync();
            logger.LogInformation(
                "Company Sales Opportunity permission backfill added {Count} keys: {Keys}",
                addedCompanySalesOpportunityPermissions.Count,
                string.Join(", ", addedCompanySalesOpportunityPermissions));

            var companyQuotationPermissionBackfill = scope.ServiceProvider.GetRequiredService<CompanyQuotationPermissionBackfillService>();
            var addedCompanyQuotationPermissions = await companyQuotationPermissionBackfill.BackfillAsync();
            logger.LogInformation(
                "Company Quotation permission backfill added {Count} keys: {Keys}",
                addedCompanyQuotationPermissions.Count,
                string.Join(", ", addedCompanyQuotationPermissions));

            var companyContractPermissionBackfill = scope.ServiceProvider.GetRequiredService<CompanyContractPermissionBackfillService>();
            var addedCompanyContractPermissions = await companyContractPermissionBackfill.BackfillAsync();
            logger.LogInformation(
                "Company Contract permission backfill added {Count} keys: {Keys}",
                addedCompanyContractPermissions.Count,
                string.Join(", ", addedCompanyContractPermissions));

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
        }
        else
        {
            logger.LogInformation("Startup backfills skipped by FOPX_SKIP_STARTUP_DATA_MUTATIONS.");
        }

        if (maySeedDemoData)
        {
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
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "FOPX One API v1");
        options.DocumentTitle = "FOPX One API Documentation";
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

    app.UseCors("ApiCors");

    // Authentication & Authorization
    app.UseAuthentication();
    app.UseAuthorization();

    // Request context
    app.UseMiddleware<RequestContextMiddleware>();

    // === ENDPOINT MAPPING ===
    app.MapControllers();
    var readinessOptions = HealthEndpointOptions.CreateReadiness(fileStoreRequired);
    app.MapHealthChecks("/health", readinessOptions).AllowAnonymous();
    app.MapHealthChecks("/health/ready", readinessOptions).AllowAnonymous();
    app.MapHealthChecks("/health/live", new HealthCheckOptions
    {
        Predicate = _ => false,
        ResponseWriter = HealthResponseWriter.WriteAsync,
    }).AllowAnonymous();
    app.MapHealthChecks("/health/dependencies", HealthEndpointOptions.CreateDependencies(fileStoreRequired)).AllowAnonymous();

    // Determine a friendly host name to present in logs (can be overridden via configuration)
    var networkConfig = builder.Configuration.GetSection("NetworkConfig");
    var hostName = networkConfig["HostName"] ?? Environment.MachineName;

    logger.LogInformation("✅ Application configured successfully");
    logger.LogInformation("🖥️  Server: {ServerName}", hostName);
    logger.LogInformation("🌐 Binding: {Address}:{Port}", apiBindAddressText, backendPort);
    logger.LogInformation("🔔 Push Notifications: Firebase Cloud Messaging (FCM)");
    logger.LogInformation("🏥 Health: /api/health");

    Console.WriteLine($"[STARTUP] ✅ Configuration complete");
    Console.WriteLine($"[STARTUP] 🖥️  Server: {hostName}");
    Console.WriteLine($"[STARTUP] 🌐 Binding: {apiBindAddressText}:{backendPort}");
    Console.WriteLine($"[STARTUP] 📡 Access via:");
    Console.WriteLine($"[STARTUP]    - http://localhost:{backendPort}");
    if (!skipStartupDataMutations)
    {
        Console.WriteLine($"[STARTUP]    - http://{hostName}:{backendPort}");
        Console.WriteLine($"[STARTUP]    - http://{hostName}.local:{backendPort}");
    }
    Console.WriteLine($"[STARTUP] 🏥 Health: http://{apiBindAddressText}:{backendPort}/api/health");
    Console.WriteLine($"[STARTUP] Press Ctrl+C to shut down.");

    // === DEVELOPMENT-ONLY: Safe dev reseed (repair-only) for identity roles & admin mapping ===
    if (app.Environment.IsDevelopment() && !skipStartupDataMutations)
    {
        using var scope = app.Services.CreateScope();
        var reseed = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Seed.DevIdentityReseedService>();
        await reseed.RepairDevelopmentIdentityDataAsync(builder.Configuration);
    }

    // Demo/test records must never be created as an implicit startup side effect,
    // especially in Production. Explicit opt-in is Development-only.
    if (maySeedDemoData)
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var seeder = scope.ServiceProvider.GetRequiredService<Investa.Infrastructure.Seed.DatabaseSeeder>();
            await seeder.SeedAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SEED-WARN] DatabaseSeeder skipped: {ex.Message}");
        }
    }
    else
    {
        logger.LogInformation(
            "Demo data seeding skipped. It requires Development plus FOPX_ENABLE_DEMO_DATA_SEEDING=true and startup data mutations enabled.");
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
static void RegisterApplicationServices(IServiceCollection services, bool skipStartupDataMutations)
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
    services.AddScoped<IProjectCategoryService, ProjectCategoryService>();
    services.AddScoped<IClientService, ClientService>();
    services.AddScoped<IOrgUserService, Investa.Infrastructure.Services.OrgUserService>();
    services.AddScoped<IInvestmentService, InvestmentService>();
    services.AddScoped<IInvestmentEventService, InvestmentEventService>();
    services.AddScoped<IInvestmentRequestService, InvestmentRequestService>();
    services.AddScoped<IInvestmentAnalyticsService, InvestmentAnalyticsService>();
    services.AddScoped<IScoreService, ScoreService>();
    services.AddScoped<ITrustService, TrustService>();
    services.AddScoped<IReputationService, ReputationService>();
    services.AddScoped<ICreditService, CreditService>();
    services.AddScoped<IWalletService, WalletService>();
    services.AddScoped<IPriceService, PriceService>();
    services.AddScoped<IPaidActionService, PaidActionService>();
    services.AddSingleton<IClientInteractionChargingPolicy, ClientInteractionChargingPolicy>();
    services.AddScoped<IReportService, ReportService>();
      services.AddScoped<IOpportunityService, OpportunityService>();
      services.AddScoped<IOpportunityObligationCompletionService, OpportunityObligationCompletionService>();
      services.AddScoped<IProjectRoomService, ProjectRoomService>();
    services.AddScoped<IProjectService, ProjectService>();
    services.AddSingleton<IProjectStageMetadataService, ProjectStageMetadataService>();
    services.AddScoped<IFounderDashboardService, FounderDashboardService>();
    services.AddScoped<IFileValidationService, DefaultFileValidationService>();
    services.AddScoped<IFileScanService, NullFileScanService>();
    services.AddScoped<IOpportunityFileAuditService, OpportunityFileAuditService>();
    services.AddScoped<ICurrencyConversionService, CurrencyConversionService>();
    services.AddScoped<ICurrencyDisplayService, CurrencyDisplayService>();
    services.AddScoped<ICurrencyAdminService, CurrencyAdminService>();
    services.AddScoped<IOpportunityTagAdminService, OpportunityTagAdminService>();
    services.AddScoped<ICompanyCustomerService, CompanyCustomerService>();
    services.AddScoped<ICompanyCatalogService, CompanyCatalogService>();
    services.AddScoped<ICompanySalesOpportunityService, CompanySalesOpportunityService>();
    services.AddScoped<ICompanyQuotationService, CompanyQuotationService>();
    services.AddScoped<ICompanyContractService, CompanyContractService>();
    services.AddScoped<IFundingGoalAdminService, FundingGoalAdminService>();
    services.AddScoped<IRiskLevelService, RiskLevelService>();
    services.AddScoped<IFileCategoryService, FileCategoryService>();
    services.AddScoped<IFileStoragePolicyService, FileStoragePolicyService>();
    services.AddScoped<IFileUploadService, FileUploadService>();
    services.AddScoped<IFundingDeclarationService, FundingDeclarationService>();
      services.AddScoped<ILoanRepaymentService, LoanRepaymentService>();
      services.AddScoped<ILoanObligationService, LoanObligationService>();
      services.AddScoped<IProfitSharingObligationService, ProfitSharingObligationService>();
      services.AddScoped<IEquityPositionService, EquityPositionService>();
      services.AddScoped<IEquityPhase3Service, EquityPhase3Service>();
      services.AddScoped<IProfitSharingLifecycleService, ProfitSharingLifecycleService>();
    services.AddScoped<ILoanLifecycleService, LoanLifecycleService>();
    services.AddScoped<ICountryService, CountryService>();
    services.AddScoped<IExchangeRateProvider, ConfigurableExchangeRateProvider>();
    services.AddScoped<IInvestmentContractService, InvestmentContractService>();
    services.AddScoped<INegotiationService, NegotiationService>();
    services.AddScoped<OpportunityProductFieldsBackfillService>();
    services.AddScoped<IChatService, ChatService>();
    services.AddScoped<IGroupService, GroupService>();
    services.AddScoped<IFinanceValidationService, FinanceValidationService>();
    services.AddScoped<IFinanceAccountingService, FinanceAccountingService>();
    services.AddScoped<IFinanceTransactionService, FinanceTransactionService>();
    services.AddScoped<IFinanceMasterDataService, FinanceMasterDataService>();
    services.AddScoped<IFinanceOverviewService, FinanceOverviewService>();
    services.AddScoped<IFinanceReconciliationService, FinanceReconciliationService>();
    services.AddScoped<IAdminUserApprovalService, AdminUserApprovalService>();

    // === INFRASTRUCTURE LAYER - External Services ===
    // Security Services (Scoped - stateful per request)
    services.AddScoped<ICryptoService, AesGcmCryptoService>();
    services.AddScoped<IKeyManagementService, LocalKeyManagementService>();
    services.AddScoped<IJwtTokenService, JwtTokenService>();
    
    // Communication Services (Scoped)
    services.AddScoped<ISmsSender, SmsSender>();

    // === EMAIL INFRASTRUCTURE (Outbox-based, async) ===
    services.AddScoped<IEmailProvider, Investa.Infrastructure.Services.Email.MailerSendEmailProvider>();
    services.AddScoped<IEmailQueue, Investa.Infrastructure.Services.Email.EmailQueue>();
    services.AddScoped<IEmailHistoryService, Investa.Infrastructure.Services.Email.EmailHistoryService>();
    services.AddScoped<IEmailPreferenceService, Investa.Infrastructure.Services.Email.EmailPreferenceService>();
    services.AddScoped<IEmailDispatcher, Investa.Infrastructure.Services.Email.EmailDispatcher>();
    services.AddScoped<IEmailTemplateRenderer, Investa.Infrastructure.Services.Email.UnifiedEmailTemplateRenderer>();
    services.AddScoped<IEmailAttachmentProvider, Investa.Infrastructure.Services.Email.NullEmailAttachmentProvider>();
    services.AddScoped<IEmailService, Investa.Infrastructure.Services.Email.EmailService>();
    services.AddScoped<IEmailOtpService, Investa.Infrastructure.Services.Email.EmailOtpService>();
    services.AddOptions<LoanLifecycleOptions>().BindConfiguration("LoanLifecycle");
    services.AddOptions<ProfitSharingLifecycleOptions>().BindConfiguration("ProfitSharingLifecycle");
    if (!skipStartupDataMutations)
    {
        services.AddHostedService<Investa.Infrastructure.Workers.EmailDispatcherWorker>();
        services.AddHostedService<Investa.Infrastructure.Workers.LoanLifecycleWorker>();
        services.AddHostedService<Investa.Infrastructure.Workers.ProfitSharingLifecycleWorker>();
    }



    // === APPLICATION LAYER - Singleton Services ===
    // Admin Availability (Singleton - shared state across all requests)
    services.AddSingleton<IAdminAvailabilityService, AdminAvailabilityService>();

    // === INFRASTRUCTURE LAYER - Notification Services ===
    // Firebase Cloud Messaging for push notifications (Scoped)
    services.AddScoped<INotificationService, NotificationService>();

    // Multi-device push notification service
    services.AddScoped<DevicePushNotificationService>();

    // Shared UserNotification creation + FCM dispatch service
    services.AddScoped<IUserNotificationService, UserNotificationService>();
    services.AddSingleton<IConversationPresenceService, ConversationPresenceService>();

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
            Title = "FOPX One API",
            Version = "v1.0.0",
            Description = "RESTful API for the FOPX One investment platform with real-time chat and notifications",
            Contact = new OpenApiContact
            {
                Name = "FOPX One Team",
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
        options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
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
