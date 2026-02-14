using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyAndHrLetterToUserProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyAddress",
                table: "UserProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyEmail",
                table: "UserProfiles",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "UserProfiles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeviceMacAddress",
                table: "UserProfiles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HrLetterBase64",
                table: "UserProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HrLetterFileName",
                table: "UserProfiles",
                type: "nvarchar(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationMonths",
                table: "Investments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PayoutFrequency",
                table: "Investments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ProfitPercentage",
                table: "Investments",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Investments",
                keyColumn: "Id",
                keyValue: 1000,
                columns: new[] { "DurationMonths", "PayoutFrequency", "ProfitPercentage" },
                values: new object[] { null, null, null });

            migrationBuilder.UpdateData(
                table: "Investments",
                keyColumn: "Id",
                keyValue: 1001,
                columns: new[] { "DurationMonths", "PayoutFrequency", "ProfitPercentage" },
                values: new object[] { null, null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyAddress",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "CompanyEmail",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "DeviceMacAddress",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "HrLetterBase64",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "HrLetterFileName",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "DurationMonths",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "PayoutFrequency",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "ProfitPercentage",
                table: "Investments");
        }
    }
}
