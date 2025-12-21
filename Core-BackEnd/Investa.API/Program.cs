using Investa.API.Middlewares;
using Investa.Application.Common;
using Investa.API.Resources;
using Investa.Application.Interfaces;
using Investa.Application.Mappings;
using Investa.Application.Services;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using FluentValidation;
using FluentValidation.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

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

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("Investa.API")));

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
        options.RequireHttpsMetadata = true;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

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

var app = builder.Build();

// Apply database migrations at startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAngular");

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseMiddleware<RequestContextMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
