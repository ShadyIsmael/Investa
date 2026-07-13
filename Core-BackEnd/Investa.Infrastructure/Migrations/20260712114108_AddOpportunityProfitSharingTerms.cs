using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityProfitSharingTerms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ProfitSharePercentage",
                table: "Opportunities",
                type: "decimal(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProfitSharingContractEndDate",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProfitSharingContractStartDate",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfitSharingPayoutFrequency",
                table: "Opportunities",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfitSharePercentage",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ProfitSharingContractEndDate",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ProfitSharingContractStartDate",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ProfitSharingPayoutFrequency",
                table: "Opportunities");
        }
    }
}
