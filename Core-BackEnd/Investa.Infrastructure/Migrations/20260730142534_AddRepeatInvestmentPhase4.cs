using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRepeatInvestmentPhase4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_InvestmentContracts_OpportunityId_FounderUserId_InvestorUserId_InvestmentModel",
                table: "InvestmentContracts");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "OpportunityJoinRequests",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParticipationSequence",
                table: "OpportunityJoinRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "ActiveRequestSlot",
                table: "OpportunityJoinRequests",
                type: "int",
                nullable: false,
                computedColumnSql: "CASE WHEN [Status] = 'Pending' THEN 0 ELSE [Id] END",
                stored: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldComputedColumnSql: "CASE WHEN [Status] IN ('Pending', 'Approved') THEN 0 ELSE [Id] END",
                oldStored: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_IdempotencyKey",
                table: "OpportunityJoinRequests",
                columns: new[] { "OpportunityId", "InvestorId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_ParticipationSequence",
                table: "OpportunityJoinRequests",
                columns: new[] { "OpportunityId", "InvestorId", "ParticipationSequence" },
                unique: true,
                filter: "[ParticipationSequence] > 0");

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_OpportunityId_FounderUserId_InvestorUserId_InvestmentModel",
                table: "InvestmentContracts",
                columns: new[] { "OpportunityId", "FounderUserId", "InvestorUserId", "InvestmentModel" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_IdempotencyKey",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_ParticipationSequence",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_InvestmentContracts_OpportunityId_FounderUserId_InvestorUserId_InvestmentModel",
                table: "InvestmentContracts");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "ParticipationSequence",
                table: "OpportunityJoinRequests");

            migrationBuilder.AlterColumn<int>(
                name: "ActiveRequestSlot",
                table: "OpportunityJoinRequests",
                type: "int",
                nullable: false,
                computedColumnSql: "CASE WHEN [Status] IN ('Pending', 'Approved') THEN 0 ELSE [Id] END",
                stored: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldComputedColumnSql: "CASE WHEN [Status] = 'Pending' THEN 0 ELSE [Id] END",
                oldStored: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentContracts_OpportunityId_FounderUserId_InvestorUserId_InvestmentModel",
                table: "InvestmentContracts",
                columns: new[] { "OpportunityId", "FounderUserId", "InvestorUserId", "InvestmentModel" },
                unique: true);
        }
    }
}
