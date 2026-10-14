using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations;

/// <inheritdoc />
public partial class AddOpportunityAdminQueryIndexes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateIndex(
            name: "IX_Opportunities_CreatedAt",
            table: "Opportunities",
            column: "CreatedAt");

        migrationBuilder.CreateIndex(
            name: "IX_Opportunities_UpdatedAt",
            table: "Opportunities",
            column: "UpdatedAt");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_Opportunities_UpdatedAt",
            table: "Opportunities");

        migrationBuilder.DropIndex(
            name: "IX_Opportunities_CreatedAt",
            table: "Opportunities");
    }
}
