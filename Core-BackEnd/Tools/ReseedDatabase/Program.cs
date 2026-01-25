using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Investa.Infrastructure.Persistence;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Microsoft.Data.SqlClient;

// Find Investa.API/appsettings.json
string? settingsPath = null;
var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
while (dir != null)
{
    var candidate = Path.Combine(dir.FullName, "Investa.API", "appsettings.json");
    if (File.Exists(candidate))
    {
        settingsPath = candidate;
        break;
    }
    dir = dir.Parent;
}

if (settingsPath == null)
{
    Console.WriteLine("Could not find Investa.API/appsettings.json. Run from repository root or a subfolder.");
    return;
}

var builder = new ConfigurationBuilder().AddJsonFile(settingsPath, optional: false, reloadOnChange: false);
var config = builder.Build();
var conn = config.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(conn))
{
    Console.WriteLine("DefaultConnection not found in appsettings.json");
    return;
}

var services = new ServiceCollection();
services.AddDbContext<ApplicationDbContext>(opt => opt.UseSqlServer(conn));
var sp = services.BuildServiceProvider();
using var scope = sp.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

// Helper for simple scalar SQL queries
string QuerySingle(string sql, params SqlParameter[] ps)
{
    using var conn2 = new SqlConnection(conn);
    conn2.Open();
    using var cmd2 = new SqlCommand(sql, conn2);
    if (ps != null && ps.Length > 0) cmd2.Parameters.AddRange(ps);
    var r = cmd2.ExecuteScalar();
    return r?.ToString();
}

Console.WriteLine("Dropping database (EnsureDeleted)...");
try
{
    db.Database.EnsureDeleted();
    Console.WriteLine("Database dropped.");
}
catch (Exception ex)
{
    Console.WriteLine("Warning: failed to drop database: " + ex.Message);
}

Console.WriteLine("Applying migrations (Migrate)...");
try
{
    db.Database.Migrate();
    Console.WriteLine("Migrations applied.");
}
catch (Exception ex)
{
    Console.WriteLine("Failed to apply migrations: " + ex.Message);
    Console.WriteLine("Attempting fallback: EnsureCreated() to initialize schema for development...");
    try
    {
        db.Database.EnsureCreated();
        Console.WriteLine("Fallback EnsureCreated() succeeded.");
    }
    catch (Exception ex2)
    {
        Console.WriteLine("Fallback EnsureCreated() failed: " + ex2.Message);
        return;
    }
}

// Create canonical AspNet roles if missing (direct SQL to avoid model dependency when using EnsureCreated fallback)
var roleNames = new[] { nameof(UserRoles.Admin), nameof(UserRoles.OrgUser), nameof(UserRoles.Client) };
var now = DateTime.UtcNow;
foreach (var rn in roleNames)
{
        var check = QuerySingle("SELECT [Id] FROM [AspNetRoles] WHERE LOWER([Name]) = @n", new SqlParameter("@n", rn.ToLowerInvariant()));
    if (string.IsNullOrEmpty(check))
    {
        var id = Guid.NewGuid().ToString();
        db.Database.ExecuteSqlRaw(@"INSERT INTO [AspNetRoles] ([Id],[Name],[NormalizedName],[ConcurrencyStamp]) VALUES (@id,@name,@norm,@cs)", new[] {
            new Microsoft.Data.SqlClient.SqlParameter("@id", id),
            new Microsoft.Data.SqlClient.SqlParameter("@name", rn),
            new Microsoft.Data.SqlClient.SqlParameter("@norm", rn.ToUpperInvariant()),
            new Microsoft.Data.SqlClient.SqlParameter("@cs", Guid.NewGuid().ToString())
        });
    }
}
Console.WriteLine("Ensured AspNetRoles exist.");

var rnd = new Random();

// Helper to create identity user via direct SQL to AspNetUsers for simplicity
PasswordHasher<IdentityUser> hasher = new();

string DefaultPassword = "P@ssw0rd";

// Clear out identity tables lightly (optional) - safer to keep for dev; here we just add new users

// Create 10 org users with different role strings
var orgRoleNames = new[] { "Admin", "Support", "Finance", "Sales", "Marketing", "Product", "Engineering", "Legal", "HR", "Operations" };
int createdOrg = 0;
foreach (var roleName in orgRoleNames)
{
    var email = $"{roleName.ToLowerInvariant()}@investa.local";

    // create AspNet user
    var identityId = Guid.NewGuid().ToString();
    var dummy = new IdentityUser { UserName = email, Email = email };
    var pwdHash = hasher.HashPassword(dummy, DefaultPassword);

    // Insert minimal AspNet user using raw SQL to avoid referencing IdentityDbSet type here
    var cmdText = @"INSERT INTO [AspNetUsers] ([Id],[UserName],[NormalizedUserName],[Email],[NormalizedEmail],[EmailConfirmed],[PasswordHash],[SecurityStamp],[ConcurrencyStamp],[PhoneNumberConfirmed],[TwoFactorEnabled],[LockoutEnabled],[AccessFailedCount])
VALUES (@id,@un,@nun,@email,@nemail,1,@ph,@ss,@cs,0,0,0,0)";
    db.Database.ExecuteSqlRaw(cmdText, new[] {
        new Microsoft.Data.SqlClient.SqlParameter("@id", identityId),
        new Microsoft.Data.SqlClient.SqlParameter("@un", email),
        new Microsoft.Data.SqlClient.SqlParameter("@nun", email.ToUpperInvariant()),
        new Microsoft.Data.SqlClient.SqlParameter("@email", email),
        new Microsoft.Data.SqlClient.SqlParameter("@nemail", email.ToUpperInvariant()),
        new Microsoft.Data.SqlClient.SqlParameter("@ph", pwdHash),
        new Microsoft.Data.SqlClient.SqlParameter("@ss", Guid.NewGuid().ToString()),
        new Microsoft.Data.SqlClient.SqlParameter("@cs", Guid.NewGuid().ToString())
    });

    // Get AspNet Role Id for 'OrgUser' and insert AspNetUserRoles
    var orgRoleId = QuerySingle("SELECT [Id] FROM [AspNetRoles] WHERE LOWER([Name]) = @n", new SqlParameter("@n", UserRoles.OrgUser.ToString().ToLowerInvariant()));
    if (string.IsNullOrEmpty(orgRoleId))
    {
        orgRoleId = Guid.NewGuid().ToString();
        db.Database.ExecuteSqlRaw(@"INSERT INTO [AspNetRoles] ([Id],[Name],[NormalizedName],[ConcurrencyStamp]) VALUES (@id,@name,@norm,@cs)", new[] {
            new Microsoft.Data.SqlClient.SqlParameter("@id", orgRoleId),
            new Microsoft.Data.SqlClient.SqlParameter("@name", UserRoles.OrgUser.ToString()),
            new Microsoft.Data.SqlClient.SqlParameter("@norm", UserRoles.OrgUser.ToString().ToUpperInvariant()),
            new Microsoft.Data.SqlClient.SqlParameter("@cs", Guid.NewGuid().ToString())
        });
    }
    db.Database.ExecuteSqlRaw("INSERT INTO [AspNetUserRoles] ([UserId],[RoleId]) VALUES ({0},{1})", identityId, orgRoleId);

    // Create domain user
    var domainUserId = Guid.NewGuid();
    var name = roleName + " User";
    db.ApplicationUsers.Add(new User { Id = domainUserId, Name = name, Email = email, Role = roleName, ClientType = ClientType.Investor });
    db.SaveChanges();

    // Create profile
    db.UserProfiles.Add(new UserProfile { UserId = domainUserId, FullName = name, FirstName = roleName, LastName = "User", Email = email, CreatedAt = now, UpdatedAt = now, AvatarUrl = $"https://i.pravatar.cc/150?img={rnd.Next(1,70)}" });
    db.SaveChanges();

    // Create AuthUser with UserType.OrgUser
    db.AuthUsers.Add(new AuthUser { Id = domainUserId, Email = email, PasswordHash = pwdHash, UserType = UserType.OrgUser, Status = true, CreatedAt = now });
    db.SaveChanges();

    createdOrg++;
}
Console.WriteLine($"Inserted {createdOrg} org users.");

// Create 200 random clients (Founders and Partners)
var firstNames = new[] { "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Cameron", "Riley", "Jamie", "Casey", "Dylan", "Bailey", "Quinn", "Avery", "Skyler", "Parker" };
var lastNames = new[] { "Smith", "Johnson", "Brown", "Garcia", "Miller", "Davis", "Martinez", "Lopez", "Wilson", "Anderson" };
int clientsToCreate = 200;
int createdClients = 0;
for (int i = 0; i < clientsToCreate; i++)
{
    var first = firstNames[rnd.Next(firstNames.Length)];
    var last = lastNames[rnd.Next(lastNames.Length)];
    var email = $"{first.ToLower()}.{last.ToLower()}.{Guid.NewGuid().ToString().Split('-')[0]}@clients.investa.local";
    var identityId = Guid.NewGuid().ToString();
    var dummy = new IdentityUser { UserName = email, Email = email };
    var pwdHash = hasher.HashPassword(dummy, DefaultPassword);

    db.Database.ExecuteSqlRaw(@"INSERT INTO [AspNetUsers] ([Id],[UserName],[NormalizedUserName],[Email],[NormalizedEmail],[EmailConfirmed],[PasswordHash],[SecurityStamp],[ConcurrencyStamp],[PhoneNumberConfirmed],[TwoFactorEnabled],[LockoutEnabled],[AccessFailedCount])
VALUES (@id,@un,@nun,@email,@nemail,1,@ph,@ss,@cs,0,0,0,0)", new[] {
        new Microsoft.Data.SqlClient.SqlParameter("@id", identityId),
        new Microsoft.Data.SqlClient.SqlParameter("@un", email),
        new Microsoft.Data.SqlClient.SqlParameter("@nun", email.ToUpperInvariant()),
        new Microsoft.Data.SqlClient.SqlParameter("@email", email),
        new Microsoft.Data.SqlClient.SqlParameter("@nemail", email.ToUpperInvariant()),
        new Microsoft.Data.SqlClient.SqlParameter("@ph", pwdHash),
        new Microsoft.Data.SqlClient.SqlParameter("@ss", Guid.NewGuid().ToString()),
        new Microsoft.Data.SqlClient.SqlParameter("@cs", Guid.NewGuid().ToString())
    });

    // assign client role
    var clientRoleId = QuerySingle("SELECT [Id] FROM [AspNetRoles] WHERE LOWER([Name]) = @n", new SqlParameter("@n", nameof(UserRoles.Client).ToLowerInvariant()));
    if (string.IsNullOrEmpty(clientRoleId))
    {
        clientRoleId = Guid.NewGuid().ToString();
        db.Database.ExecuteSqlRaw(@"INSERT INTO [AspNetRoles] ([Id],[Name],[NormalizedName],[ConcurrencyStamp]) VALUES (@id,@name,@norm,@cs)", new[] {
            new Microsoft.Data.SqlClient.SqlParameter("@id", clientRoleId),
            new Microsoft.Data.SqlClient.SqlParameter("@name", nameof(UserRoles.Client)),
            new Microsoft.Data.SqlClient.SqlParameter("@norm", nameof(UserRoles.Client).ToUpperInvariant()),
            new Microsoft.Data.SqlClient.SqlParameter("@cs", Guid.NewGuid().ToString())
        });
    }
    db.Database.ExecuteSqlRaw("INSERT INTO [AspNetUserRoles] ([UserId],[RoleId]) VALUES ({0},{1})", identityId, clientRoleId);

    var domainUserId = Guid.NewGuid();
    var fullName = $"{first} {last}";
    var role = "Founder"; // role string in domain User
    var clientType = (rnd.NextDouble() < 0.6) ? ClientType.Founder : ClientType.Investor; // treat Investor in ClientType as Partner fallback or both
    if (rnd.NextDouble() < 0.25) clientType = ClientType.Both; // some both

    db.ApplicationUsers.Add(new User { Id = domainUserId, Name = fullName, Email = email, Role = role, ClientType = clientType });
    db.SaveChanges();

    // profile + avatar
    var avatarUrl = $"https://i.pravatar.cc/150?img={rnd.Next(1,70)}";
    db.UserProfiles.Add(new UserProfile { UserId = domainUserId, FullName = fullName, FirstName = first, LastName = last, Email = email, AvatarUrl = avatarUrl, CreatedAt = now, UpdatedAt = now });
    db.SaveChanges();

    // AuthUser - map to domain user id to simplify
    db.AuthUsers.Add(new AuthUser { Id = domainUserId, Email = email, PasswordHash = pwdHash, UserType = clientType == ClientType.Founder ? UserType.Founder : UserType.OrgUser, Status = true, CreatedAt = now });
    db.SaveChanges();

    // client record
    var clientEntity = new Client
    {
        UserId = domainUserId,
        FirstName = first,
        LastName = last,
        PersonalImageUrl = avatarUrl,
        Email = email,
        Country = "US",
        City = "Sample City",
        BusinessRole = "Founder",
        Score = rnd.Next(0, 5000),
        Credit = 0m,
        StatusId = 1,
        ClientType = (clientType == ClientType.Investor) ? ClientType.Investor : (clientType == ClientType.Founder ? ClientType.Founder : ClientType.Both),
        CreatedAt = now,
        UpdatedAt = now
    };
    db.Clients.Add(clientEntity);
    db.SaveChanges();

    createdClients++;
}

Console.WriteLine($"Inserted {createdClients} clients and {createdOrg} org users.");
Console.WriteLine("Reseed complete.");
