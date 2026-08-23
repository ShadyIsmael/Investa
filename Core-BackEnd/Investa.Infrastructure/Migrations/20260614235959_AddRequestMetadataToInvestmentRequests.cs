using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    public partial class AddRequestMetadataToInvestmentRequests : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "IF COL_LENGTH('InvestmentRequests', 'RequestMetadata') IS NULL ALTER TABLE [InvestmentRequests] ADD [RequestMetadata] nvarchar(max) NULL;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // The column may have been created by the preceding migration or the baseline.
        }
    }
}
