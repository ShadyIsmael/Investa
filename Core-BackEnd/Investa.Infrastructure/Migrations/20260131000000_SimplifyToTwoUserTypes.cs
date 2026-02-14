using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <summary>
    /// BE-400: Simplify user types to only OrgUser and Client
    /// 
    /// Business Value: Simplifies the authentication model by consolidating all external users 
    /// (investors, founders, partners) into a single "Client" type, reducing complexity and 
    /// eliminating confusion. Admin privileges are now managed solely through RBAC (Groups/Permissions).
    /// 
    /// Migration Logic:
    /// 1. Convert all Founder (1) and Partner (2) UserType values to Client (1)
    /// 2. OrgUser (0) remains unchanged
    /// 3. Remove ClientType column from Clients table (no longer needed)
    /// 
    /// CRITICAL: Backup database before running this migration in production!
    /// </summary>
    public partial class SimplifyToTwoUserTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Update AuthUsers table - Convert Founder(1) and Partner(2) to Client(1)
            // Since EF stores enums as integers by default, we update numeric values
            migrationBuilder.Sql(@"
                -- Convert all Founder (old value 1) and Partner (old value 2) to Client (new value 1)
                -- OrgUser (0) remains at 0
                UPDATE ""AuthUsers""
                SET ""UserType"" = 1
                WHERE ""UserType"" IN (1, 2);
                
                -- Verification query (run manually after migration):
                -- SELECT ""UserType"", COUNT(*) AS Count 
                -- FROM ""AuthUsers"" 
                -- GROUP BY ""UserType"" 
                -- ORDER BY ""UserType"";
                -- Expected: 0 = OrgUser, 1 = Client
            ");

            // Step 2: Remove ClientType column from Clients table
            migrationBuilder.DropColumn(
                name: "ClientType",
                table: "Clients");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore ClientType column (nullable)
            migrationBuilder.AddColumn<int>(
                name: "ClientType",
                table: "Clients",
                type: "integer",
                nullable: true);

            // Note: Cannot restore original Founder/Partner distinction as that data is lost
            // All Client (1) values will remain as Client (1) in downgrade
            // Manual intervention required if you need to restore the old three-type system
            migrationBuilder.Sql(@"
                -- Warning: Downgrade cannot restore original Founder vs Partner distinction
                -- All users with UserType = 1 will remain as 1
                -- Manual data restoration required if needed
                SELECT 'WARNING: ClientType data cannot be automatically restored' AS Message;
            ");
        }
    }
}
