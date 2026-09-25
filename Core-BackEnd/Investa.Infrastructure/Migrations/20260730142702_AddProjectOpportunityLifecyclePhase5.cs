using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectOpportunityLifecyclePhase5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ClosedAt",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClosureReason",
                table: "Opportunities",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FundingClosesAt",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FundingOpensAt",
                table: "Opportunities",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FundingStatus",
                table: "Opportunities",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "NotScheduled");

            migrationBuilder.AddColumn<string>(
                name: "ModerationStatus",
                table: "Opportunities",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "Draft");

            migrationBuilder.Sql(
                """
                UPDATE [Opportunities]
                SET [ModerationStatus] =
                    CASE [Status]
                        WHEN 'UnderReview' THEN 'UnderReview'
                        WHEN 'Rejected' THEN 'Rejected'
                        WHEN 'Approved' THEN 'Approved'
                        WHEN 'Published' THEN 'Approved'
                        WHEN 'Funding' THEN 'Approved'
                        WHEN 'FullyFunded' THEN 'Approved'
                        WHEN 'InProgress' THEN 'Approved'
                        WHEN 'Completed' THEN 'Approved'
                        WHEN 'Archived' THEN 'Approved'
                        ELSE 'Draft'
                    END,
                    [FundingStatus] =
                    CASE [Status]
                        WHEN 'Published' THEN 'Open'
                        WHEN 'Funding' THEN 'Open'
                        WHEN 'FullyFunded' THEN 'Closed'
                        WHEN 'InProgress' THEN 'Closed'
                        WHEN 'Completed' THEN 'Closed'
                        WHEN 'Archived' THEN 'Closed'
                        ELSE 'NotScheduled'
                    END,
                    [FundingOpensAt] =
                    CASE WHEN [Status] IN ('Published', 'Funding', 'FullyFunded', 'InProgress', 'Completed', 'Archived')
                         THEN [CreatedAt] ELSE NULL END,
                    [ClosedAt] =
                    CASE WHEN [Status] IN ('FullyFunded', 'InProgress', 'Completed', 'Archived')
                         THEN COALESCE([UpdatedAt], [CreatedAt]) ELSE NULL END,
                    [ClosureReason] =
                    CASE WHEN [Status] = 'FullyFunded' THEN 'TargetReached'
                         WHEN [Status] IN ('InProgress', 'Completed', 'Archived') THEN 'FounderClosed'
                         ELSE NULL END;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_FundingClosesAt",
                table: "Opportunities",
                column: "FundingClosesAt");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_FundingStatus",
                table: "Opportunities",
                column: "FundingStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Opportunities_ModerationStatus",
                table: "Opportunities",
                column: "ModerationStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Opportunities_FundingClosesAt",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_FundingStatus",
                table: "Opportunities");

            migrationBuilder.DropIndex(
                name: "IX_Opportunities_ModerationStatus",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ClosedAt",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ClosureReason",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "FundingClosesAt",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "FundingOpensAt",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "FundingStatus",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ModerationStatus",
                table: "Opportunities");
        }
    }
}
