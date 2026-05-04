using System;
using System.IO;
using System.Text.Json;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using Npgsql;
using Investa.Infrastructure.Identity;
using Investa.Domain.Entities.Security;

const string solutionRoot = "..\\..\\..\\..\\..";
string repoRoot = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, solutionRoot));
string appsettingsPath = Path.Combine(repoRoot, "Investa.API", "appsettings.json");

if (!File.Exists(appsettingsPath))
{
    Console.Error.WriteLine($"Could not find appsettings.json at: {appsettingsPath}");
    Environment.Exit(2);
}

var json = JsonDocument.Parse(File.ReadAllText(appsettingsPath));
if (!json.RootElement.TryGetProperty("ConnectionStrings", out JsonElement connSection))
{
    Console.Error.WriteLine("ConnectionStrings section not found in appsettings.json");
    Environment.Exit(2);
}
if (!connSection.TryGetProperty("DefaultConnection", out JsonElement defaultConn))
{
    Console.Error.WriteLine("DefaultConnection not found in appsettings.json");
    Environment.Exit(2);
}

string connectionString = defaultConn.GetString() ?? throw new InvalidOperationException("Connection string empty");

// Admin credentials
string adminEmail = "admin@investa.com"; // Corrected email (typo fix)
string adminPassword = "P@ssw0rd";
string adminName = "Platform Admin";

string adminRole = "Admin";

try
{
    using var conn = new NpgsqlConnection(connectionString);
    conn.Open();

    // Check existing AspNetUsers
    using (var cmd = new NpgsqlCommand("SELECT \"Id\" FROM \"AspNetUsers\" WHERE LOWER(\"Email\") = @email", conn))
    {
        cmd.Parameters.AddWithValue("@email", adminEmail.ToLowerInvariant());
        var existing = cmd.ExecuteScalar();
        if (existing != null)
        {
            Console.WriteLine("Admin user already exists (AspNetUsers). No changes made.");
            Environment.Exit(0);
        }
    }

    // Ensure role exists
    Guid roleId;
    using (var cmd = new NpgsqlCommand("SELECT \"Id\" FROM \"AspNetRoles\" WHERE LOWER(\"Name\") = @r", conn))
    {
        cmd.Parameters.AddWithValue("@r", adminRole.ToLowerInvariant());
        var r = cmd.ExecuteScalar();
        if (r != null)
        {
            roleId = (Guid)r;
        }
        else
        {
            roleId = Guid.NewGuid();
            using var ins = new NpgsqlCommand("INSERT INTO \"AspNetRoles\" (\"Id\", \"Name\", \"NormalizedName\", \"ConcurrencyStamp\") VALUES (@id,@name,@norm,@cs)", conn);
            ins.Parameters.AddWithValue("@id", roleId);
            ins.Parameters.AddWithValue("@name", adminRole);
            ins.Parameters.AddWithValue("@norm", adminRole.ToUpperInvariant());
            ins.Parameters.AddWithValue("@cs", Guid.NewGuid().ToString());
            ins.ExecuteNonQuery();
            Console.WriteLine($"Created role '{adminRole}' (Id={roleId}).");
        }
    }

    // Create Identity user
    var identityUserId = Guid.NewGuid();
    var hasher = new PasswordHasher<ApplicationIdentityUser>();
    var dummy = new ApplicationIdentityUser { UserName = adminEmail, Email = adminEmail };
    var passwordHash = hasher.HashPassword(dummy, adminPassword);

    using (var cmd = new NpgsqlCommand(@"INSERT INTO \"AspNetUsers\" (\"Id\", \"UserName\", \"NormalizedUserName\", \"Email\", \"NormalizedEmail\", \"EmailConfirmed\", \"PasswordHash\", \"SecurityStamp\", \"ConcurrencyStamp\", \"PhoneNumberConfirmed\", \"TwoFactorEnabled\", \"LockoutEnabled\", \"AccessFailedCount\")
VALUES (@id,@un,@nun,@email,@nemail, @ec, @ph, @ss, @cs, @pc, @tf, @le, @af)", conn))
    {
        cmd.Parameters.AddWithValue("@id", identityUserId);
        cmd.Parameters.AddWithValue("@un", adminEmail);
        cmd.Parameters.AddWithValue("@nun", adminEmail.ToUpperInvariant());
        cmd.Parameters.AddWithValue("@email", adminEmail);
        cmd.Parameters.AddWithValue("@nemail", adminEmail.ToUpperInvariant());
        cmd.Parameters.AddWithValue("@ec", true);
        cmd.Parameters.AddWithValue("@ph", passwordHash);
        cmd.Parameters.AddWithValue("@ss", Guid.NewGuid().ToString());
        cmd.Parameters.AddWithValue("@cs", Guid.NewGuid().ToString());
        cmd.Parameters.AddWithValue("@pc", false);
        cmd.Parameters.AddWithValue("@tf", false);
        cmd.Parameters.AddWithValue("@le", false);
        cmd.Parameters.AddWithValue("@af", 0);
        cmd.ExecuteNonQuery();
    }
    Console.WriteLine($"Created Identity user (Id={identityUserId}).");

    // Assign role
    using (var cmd = new NpgsqlCommand("INSERT INTO \"AspNetUserRoles\" (\"UserId\", \"RoleId\") VALUES (@uid,@rid)", conn))
    {
        cmd.Parameters.AddWithValue("@uid", identityUserId);
        cmd.Parameters.AddWithValue("@rid", roleId);
        cmd.ExecuteNonQuery();
    }
    Console.WriteLine($"Assigned role '{adminRole}' to user.");

    // Create ApplicationUsers (domain User)
    var domainUserId = Guid.NewGuid();
    using (var cmd = new NpgsqlCommand("INSERT INTO \"ApplicationUsers\" (\"Id\", \"Name\", \"Email\", \"Role\", \"ClientType\", \"CredibilityScore\", \"WalletBalance\") VALUES (@id,@name,@email,@role, @ct, @cs, @wb)", conn))
    {
        cmd.Parameters.AddWithValue("@id", domainUserId);
        cmd.Parameters.AddWithValue("@name", adminName);
        cmd.Parameters.AddWithValue("@email", adminEmail);
        cmd.Parameters.AddWithValue("@role", adminRole);
        cmd.Parameters.AddWithValue("@ct", 0);
        cmd.Parameters.AddWithValue("@cs", 3500);
        cmd.Parameters.AddWithValue("@wb", 0m);
        cmd.ExecuteNonQuery();
    }
    Console.WriteLine($"Created domain user (Id={domainUserId}).");

    // Create UserProfile (Id is serial) - insert subset of columns
    using (var cmd = new NpgsqlCommand("INSERT INTO \"UserProfiles\" (\"UserId\", \"FullName\", \"Email\", \"CreatedAt\", \"UpdatedAt\") VALUES (@uid,@full,@email, NOW(), NOW())", conn))
    {
        cmd.Parameters.AddWithValue("@uid", domainUserId);
        cmd.Parameters.AddWithValue("@full", adminName);
        cmd.Parameters.AddWithValue("@email", adminEmail);
        cmd.ExecuteNonQuery();
    }
    Console.WriteLine("Created UserProfile record.");

    // Optionally create AuthUser record for compatibility (set UserType to OrgUser)
    using (var cmd = new NpgsqlCommand("INSERT INTO \"AuthUsers\" (\"Id\", \"Email\", \"PasswordHash\", \"UserType\", \"Status\", \"CreatedAt\") VALUES (@id,@email,@ph,@ut,@st,NOW())", conn))
    {
        var authId = Guid.NewGuid();
        cmd.Parameters.AddWithValue("@id", authId);
        cmd.Parameters.AddWithValue("@email", adminEmail);
        cmd.Parameters.AddWithValue("@ph", passwordHash);
        cmd.Parameters.AddWithValue("@ut", (int)Investa.Domain.Entities.Enums.UserType.OrgUser);
        cmd.Parameters.AddWithValue("@st", true);
        cmd.ExecuteNonQuery();
    }
    Console.WriteLine("Created AuthUser record.");

    // Verify assignment: ensure the user exists in role
    using (var cmd = new NpgsqlCommand(@"SELECT COUNT(1) FROM \"AspNetUserRoles\" ur
        JOIN \"AspNetUsers\" u ON ur.\"UserId\" = u.\"Id\"
        JOIN \"AspNetRoles\" r ON ur.\"RoleId\" = r.\"Id\"
        WHERE LOWER(u.\"Email\") = @email AND LOWER(r.\"Name\") = @role", conn))
    {
        cmd.Parameters.AddWithValue("@email", adminEmail.ToLowerInvariant());
        cmd.Parameters.AddWithValue("@role", adminRole.ToLowerInvariant());
        var count = Convert.ToInt32(cmd.ExecuteScalar());
        if (count > 0)
        {
            Console.WriteLine($"Verification: user '{adminEmail}' is assigned role '{adminRole}'.");
        }
        else
        {
            Console.Error.WriteLine($"Verification FAILED: user '{adminEmail}' is not assigned role '{adminRole}'. Please check database.");
            Environment.Exit(4);
        }
    }

    Console.WriteLine("Admin creation completed successfully.");
}
catch (Exception ex)
{
    Console.Error.WriteLine("Error: " + ex.Message);
    Environment.Exit(3);
}

Environment.Exit(0);
