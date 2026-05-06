using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    public partial class BEXXXAddRequestTypeToInvestmentRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RequestType",
                table: "InvestmentRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            // Set default for existing rows
            migrationBuilder.Sql("UPDATE InvestmentRequests SET RequestType = 'investment_request' WHERE RequestType IS NULL;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequestType",
                table: "InvestmentRequests");
        }
    }
}