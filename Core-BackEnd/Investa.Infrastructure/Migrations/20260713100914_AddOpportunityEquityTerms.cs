using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityEquityTerms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "Opportunities",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OfferedShares",
                table: "Opportunities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SharePrice",
                table: "Opportunities",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalShares",
                table: "Opportunities",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "OfferedShares",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "SharePrice",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "TotalShares",
                table: "Opportunities");
        }
    }
}
