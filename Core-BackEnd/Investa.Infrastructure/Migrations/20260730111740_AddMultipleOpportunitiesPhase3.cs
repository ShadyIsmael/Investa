using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMultipleOpportunitiesPhase3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                table: "Opportunities",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "General funding");

            migrationBuilder.AddColumn<int>(
                name: "SequenceNumber",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);

migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Opportunities",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "Opportunity");

// Phase 1 intentionally created one Project per Opportunity, but rank
            // defensively so upgrades remain safe if Phase 2 data already contains
            // manually associated opportunities. Existing IDs and timestamps are not
            // changed; CreatedAt then Id provides deterministic ordering.
            migrationBuilder.Sql(
                """
                ;WITH RankedOpportunities AS
                (
                    SELECT [Id],
                           ROW_NUMBER() OVER
                           (
                               PARTITION BY [ProjectId]
                               ORDER BY [CreatedAt], [Id]
                           ) AS [OpportunitySequence]
                    FROM [Opportunities]
                )
                UPDATE o
                SET [SequenceNumber] = r.[OpportunitySequence]
                FROM [Opportunities] o
                INNER JOIN RankedOpportunities r ON r.[Id] = o.[Id];
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ProjectId_SequenceNumber",
                table: "Opportunities",
                columns: new[] { "ProjectId", "SequenceNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Opportunities_ProjectId_SequenceNumber",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "SequenceNumber",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Opportunities");
        }
    }
}
