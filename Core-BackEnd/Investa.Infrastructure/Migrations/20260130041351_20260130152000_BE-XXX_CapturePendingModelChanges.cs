using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class _20260130152000_BEXXX_CapturePendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent: only add the column if it does not already exist (prevents duplicate-add failures).
            migrationBuilder.Sql(@"IF NOT EXISTS (
    SELECT 1 FROM sys.columns WHERE Name = N'RequestType' AND Object_ID = Object_ID(N'dbo.InvestmentRequests')
)
BEGIN
    ALTER TABLE [InvestmentRequests] ADD [RequestType] nvarchar(50) NULL;
    UPDATE InvestmentRequests SET RequestType = 'investment_request' WHERE RequestType IS NULL;
END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop only if the column exists
            migrationBuilder.Sql(@"IF EXISTS (
    SELECT 1 FROM sys.columns WHERE Name = N'RequestType' AND Object_ID = Object_ID(N'dbo.InvestmentRequests')
)
BEGIN
    ALTER TABLE [InvestmentRequests] DROP COLUMN [RequestType];
END");
        }
    }
}
