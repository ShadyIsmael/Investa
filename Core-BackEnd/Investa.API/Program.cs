using System.Text;
using System.Text.Json;
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
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Services;
using Investa.Infrastructure.Repositories;

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
                sqlOptions.CommandTimeout(30);
                sqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
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

    // === DEVELOPMENT-ONLY: Ensure a seeded admin user exists for local testing ===
    if (app.Environment.IsDevelopment())
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var svcProv = scope.ServiceProvider;
            var userManager = svcProv.GetRequiredService<UserManager<Investa.Infrastructure.Identity.ApplicationIdentityUser>>();
            var roleManager = svcProv.GetRequiredService<RoleManager<Investa.Infrastructure.Identity.ApplicationIdentityRole>>();
            var uow = svcProv.GetRequiredService<IUnitOfWork>();

            var adminEmail = builder.Configuration["Admin:Email"] ?? "admin@investa.com";
            var adminPassword = builder.Configuration["Admin:Password"] ?? "P@ssw0rd";
            var adminDisplayName = builder.Configuration["Admin:Name"] ?? "Platform Admin";
            var adminRoleName = "Admin";

            // Ensure role exists
            if (!await roleManager.RoleExistsAsync(adminRoleName))
            {
                var role = new Investa.Infrastructure.Identity.ApplicationIdentityRole
                {
                    Name = adminRoleName,
                    NormalizedName = adminRoleName.ToUpperInvariant()
                };
                await roleManager.CreateAsync(role);
                Console.WriteLine($"[SEED] Created role: {adminRoleName}");
            }

            // Ensure identity user
            var normalizedEmail = adminEmail.Trim().ToLowerInvariant();
            var existing = await userManager.FindByEmailAsync(normalizedEmail);
            if (existing == null)
            {
                var username = normalizedEmail.Replace("@", "_").Replace(".", "_");
                var newUser = new Investa.Infrastructure.Identity.ApplicationIdentityUser
                {
                    Id = Guid.NewGuid(),
                    UserName = username,
                    Email = normalizedEmail,
                    EmailConfirmed = true
                };
                var res = await userManager.CreateAsync(newUser, adminPassword);
                if (!res.Succeeded)
                {
                    Console.WriteLine($"[SEED] Failed to create admin Identity user: {string.Join(';', res.Errors.Select(e => e.Description))}");
                }
                else
                {
                    await userManager.AddToRoleAsync(newUser, adminRoleName);
                    Console.WriteLine($"[SEED] Created admin Identity user: {normalizedEmail}");

                    // Create domain and auth records
                    var guid = newUser.Id;
                    if (guid != Guid.Empty)
                    {
                        try
                        {
                            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<Investa.Infrastructure.Identity.ApplicationIdentityUser>();
                            var authUser = new Investa.Domain.Entities.AuthUser
                            {
                                Id = guid,
                                Name = adminDisplayName,
                                Email = normalizedEmail,
                                PasswordHash = passwordHasher.HashPassword(newUser, adminPassword),
                                UserType = Investa.Domain.Entities.Enums.UserType.OrgUser,
                                Status = true,
                                CreatedAt = DateTime.UtcNow
                            };
                            await uow.Repository<Investa.Domain.Entities.AuthUser>().AddAsync(authUser);

                            await uow.SaveChangesAsync();
                            Console.WriteLine($"[SEED] Created auth record for admin: {normalizedEmail}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[SEED] Warning: failed to create domain/auth records: {ex.Message}");
                        }
                    }
                }
            }
            else
            {
                // Ensure role assignment
                if (!await userManager.IsInRoleAsync(existing, adminRoleName))
                {
                    await userManager.AddToRoleAsync(existing, adminRoleName);
                    Console.WriteLine($"[SEED] Added existing user to role '{adminRoleName}': {normalizedEmail}");
                }
                else
                {
                    Console.WriteLine($"[SEED] Admin user already present and assigned: {normalizedEmail}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SEED] Error while seeding admin user: {ex.Message}");
        }
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
    // === INFRASTRUCTURE LAYER ===
    // Unit of Work & Repository Pattern (Scoped - per request)
    services.AddScoped<IUnitOfWork, UnitOfWork>();
    services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
    
    // Specialized repositories with complex query support
    services.AddScoped<IInvestmentRepository, InvestmentRepository>();

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
    services.AddScoped<IChatService, ChatService>();
    services.AddScoped<IGroupService, GroupService>();

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
