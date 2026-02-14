using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    public partial class AddContactCity_RemoveWorkAddress : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add Country column if it doesn't exist (nullable)
            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "UserProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            // Add City column
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "UserProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            // Remove WorkAddress column
            migrationBuilder.DropColumn(
                name: "WorkAddress",
                table: "UserProfiles");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate WorkAddress column
            migrationBuilder.AddColumn<string>(
                name: "WorkAddress",
                table: "UserProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            // Remove City column
            migrationBuilder.DropColumn(
                name: "City",
                table: "UserProfiles");

            // Remove Country column
            migrationBuilder.DropColumn(
                name: "Country",
                table: "UserProfiles");
        }
    }
}
