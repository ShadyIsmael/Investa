using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

public partial class ResetReputationScoresToZero : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE [AuthUsers]
            SET [ReputationScore] = 0,
                [ActivityScore] = 0,
                [ReputationLevel] = N'New Member';
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // A data reset cannot be reversed without an external backup.
    }
}
