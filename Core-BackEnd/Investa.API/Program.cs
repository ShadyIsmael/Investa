using Investa.API.Middlewares;
using Investa.Application.Common;
using Investa.API.Resources;
using Investa.Application.Interfaces;
using Investa.Application.Mappings;
using Investa.Application.Services;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Investa.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using FluentValidation;
using FluentValidation.AspNetCore;
using System.Text;

Console.WriteLine("Program starting: Building host...");
var builder = WebApplication.CreateBuilder(args);
Console.WriteLine($"ContentRoot: {builder.Environment.ContentRootPath}");

// Serilog structured logging
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration));

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Localization
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.AddSingleton<IStringLocalizerFactory, ResourceManagerStringLocalizerFactory>();
// Provide non-generic IStringLocalizer for services in other projects that depend on it
builder.Services.AddSingleton(typeof(Microsoft.Extensions.Localization.IStringLocalizer), sp =>
    sp.GetRequiredService<Microsoft.Extensions.Localization.IStringLocalizer<Investa.API.Resources.SharedResource>>());

// Database (SQL Server - use DefaultConnection which now points to the SQL Server instance)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("Investa.Infrastructure")));

// ASP.NET Core Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    // Password requirements
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;

    // User settings
    options.User.RequireUniqueEmail = false; // Email not required
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._+";
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Repositories and Unit of Work
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Services
builder.Services.AddScoped<IInvestmentService, InvestmentService>();
builder.Services.AddScoped<IScoreService, ScoreService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICreditService, CreditService>();
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<Investa.Application.Interfaces.IChatService, Investa.Application.Services.ChatService>();
// SMS sender (development) - replace with provider implementation in production
builder.Services.AddScoped<Investa.Application.Interfaces.ISmsSender, Investa.Infrastructure.Services.SmsSender>();

// Key management and crypto services for chat encryption
builder.Services.AddSingleton<Investa.Application.Interfaces.IKeyManagementService, Investa.Infrastructure.Services.LocalKeyManagementService>();
builder.Services.AddSingleton<Investa.Application.Interfaces.ICryptoService, Investa.Infrastructure.Services.AesGcmCryptoService>();

// Localizer is registered earlier; LookupService needs IStringLocalizer<SharedResource>

// AutoMapper
builder.Services.AddAutoMapper(config => config.AddProfile<MappingProfile>());

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Investa.Application.DTOs.CreateInvestmentDto>();

// Authentication & Authorization (JWT)
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection.GetValue<string>("Key") ?? string.Empty;
var jwtIssuer = jwtSection.GetValue<string>("Issuer") ?? string.Empty;
var jwtAudience = jwtSection.GetValue<string>("Audience") ?? string.Empty;

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // Set to false for development (HTTP)
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
                // Ensure role claims from JWT are mapped to ClaimTypes.Role
                RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        // Allow JWT access_token in query string for SignalR websocket requests
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"].FirstOrDefault();
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/hubs/notifications") || path.StartsWithSegments("/hubs/chat")))
                {
                    context.Token = accessToken;
                }

                return System.Threading.Tasks.Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Standardize on role-based authorization via [Authorize(Roles = "OrgUser")]
});

// CORS
// CORS - allow any origin/header/method (open for development)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        // Allow any origin. Using SetIsOriginAllowed allows credentials
        // while still permitting any origin. Be cautious in production.
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register SignalR services
builder.Services.AddSignalR();

// Request context for per-request user/org info
builder.Services.AddScoped<RequestContext>();

// Swagger JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Investa API", Version = "v1" });
    var securityScheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    var securityRequirement = new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            securityScheme, new string[] { }
        }
    };
    c.AddSecurityRequirement(securityRequirement);
    c.DocumentFilter<Investa.API.Swagger.LookupExamplesDocumentFilter>();
});

// Bind Kestrel to all network interfaces to avoid invalid-address bind errors.
// Determine port from ASPNETCORE_URLS if available, otherwise default to 5235.
var defaultPort = 5235;
var urlsEnv = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
var selectedPort = defaultPort;
if (!string.IsNullOrWhiteSpace(urlsEnv))
{
    var first = urlsEnv.Split(';')[0];
    if (Uri.TryCreate(first, UriKind.Absolute, out var parsed))
    {
        selectedPort = parsed.Port != 0 ? parsed.Port : defaultPort;
    }
}

// preferredLocalIp lets local dev override which network interface to bind to.
// Default to 0.0.0.0 to listen on all IPv4 interfaces. Can be overridden
// via the PREFERRED_LOCAL_IP environment variable if needed.
var preferredLocalIp = Environment.GetEnvironmentVariable("PREFERRED_LOCAL_IP") ?? "0.0.0.0";

builder.WebHost.UseUrls($"http://{preferredLocalIp}:{selectedPort}");

try
{
    var app = builder.Build();

    // Apply database migrations at startup in Development to keep local DB schema up-to-date.
    if (app.Environment.IsDevelopment())
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            try
            {
                db.Database.Migrate();
                Console.WriteLine("Database migrations applied successfully.");

                // Seed initial admin user if not exists
                try
                {
                    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    var logger = scope.ServiceProvider.GetService<ILogger<Program>>();

                    var adminEmail = "admin@investa.com";
                    var adminPassword = "P@ssw0rd";

                    var existing = userManager.FindByEmailAsync(adminEmail).GetAwaiter().GetResult();
                    if (existing == null)
                    {
                        var guid = Guid.NewGuid();
                        var username = adminEmail.Replace("@", "_").Replace(".", "_");
                        var identityUser = new IdentityUser
                        {
                            Id = guid.ToString(),
                            UserName = username,
                            Email = adminEmail,
                            EmailConfirmed = true
                        };

                        var createRes = userManager.CreateAsync(identityUser, adminPassword).GetAwaiter().GetResult();
                        if (!createRes.Succeeded)
                        {
                            logger?.LogWarning("Failed to create initial admin Identity user: {Errors}", string.Join(',', createRes.Errors.Select(e => e.Description)));
                        }
                        else
                        {
                            // Add name claims
                            userManager.AddClaimAsync(identityUser, new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.GivenName, "Admin")).GetAwaiter().GetResult();
                            userManager.AddClaimAsync(identityUser, new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Surname, "User")).GetAwaiter().GetResult();

                            // Create AuthUser and domain user/profile
                            try
                            {
                                var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<IdentityUser>();
                                var authUser = new Investa.Domain.Entities.AuthUser
                                {
                                    Id = guid,
                                    Email = adminEmail,
                                    PasswordHash = passwordHasher.HashPassword(identityUser, adminPassword),
                                    UserType = Investa.Domain.Entities.Enums.UserType.OrgUser,
                                    Status = true
                                };

                                unitOfWork.Repository<Investa.Domain.Entities.AuthUser>().AddAsync(authUser).GetAwaiter().GetResult();

                                var domainUser = new Investa.Domain.Entities.User
                                {
                                    Id = guid,
                                    Name = "Admin User",
                                    Email = adminEmail,
                                    Role = "OrgUser",
                                    WalletBalance = 0m
                                };

                                unitOfWork.Repository<Investa.Domain.Entities.User>().AddAsync(domainUser).GetAwaiter().GetResult();

                                var profile = new Investa.Domain.Entities.UserProfile
                                {
                                    UserId = domainUser.Id,
                                    FirstName = "Admin",
                                    LastName = "User",
                                    FullName = domainUser.Name,
                                    Phone1 = null,
                                    Email = adminEmail,
                                    CreatedAt = DateTime.UtcNow,
                                    UpdatedAt = DateTime.UtcNow
                                };

                                unitOfWork.Repository<Investa.Domain.Entities.UserProfile>().AddAsync(profile).GetAwaiter().GetResult();

                                unitOfWork.SaveChangesAsync().GetAwaiter().GetResult();

                                logger?.LogInformation("Initial admin user created: {Email}", adminEmail);
                            }
                            catch (Exception ex)
                            {
                                logger?.LogError(ex, "Failed to create AuthUser/domain records for initial admin {Email}", adminEmail);
                            }
                        }
                    }
                    else
                    {
                        logger?.LogInformation("Initial admin already exists: {Email}", adminEmail);
                    }
                }
                catch (Exception seedEx)
                {
                    Console.WriteLine("Seeding admin user failed: " + seedEx);
                }

            }
            catch (Exception migEx)
            {
                Console.WriteLine("Database migration failed: " + migEx);
                throw;
            }
        }
    }

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    // Apply CORS after other middleware so preflight OPTIONS requests
    // are handled and not redirected.
    app.UseCors("DefaultCors");

    app.UseMiddleware<GlobalExceptionMiddleware>();

    app.UseAuthentication();
    app.UseMiddleware<RequestContextMiddleware>();
    app.UseAuthorization();

    app.MapControllers();
    // SignalR hub endpoints
    app.MapHub<Investa.API.Hubs.NotificationHub>("/hubs/notifications");
    app.MapHub<Investa.API.Hubs.ChatHub>("/hubs/chat");

    app.Run();
}
catch (Exception ex)
{
    // Ensure startup exceptions are visible in console to aid debugging
    Console.WriteLine("Startup failed: " + ex.ToString());
    throw;
}

// Needed for WebApplicationFactory in integration tests
public partial class Program { }
