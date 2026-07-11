using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaidActionPricingRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ReferenceType",
                table: "WalletTransactions",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "None",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "None");

            migrationBuilder.AddColumn<string>(
                name: "ActionCode",
                table: "WalletTransactions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PricingRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ActionCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreditCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PricingRules", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "PricingRules",
                columns: new[] { "Id", "Action", "ActionCode", "CreditCost", "CreatedAt", "Description", "DisplayName", "IsActive", "UpdatedAt" },
                columnTypes: new[] { "int", "nvarchar(100)", "nvarchar(100)", "decimal(18,2)", "datetime2", "nvarchar(500)", "nvarchar(200)", "bit", "datetime2" },
                values: new object[,]
                {
                    { 1, "SendConversationRequest", "SendConversationRequest", 5m, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Fixed CREDIT fee to send a negotiation conversation request.", "Send Conversation Request", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "SendFirstOffer", "SendFirstOffer", 5m, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Fixed CREDIT fee to send the first negotiation offer.", "Send First Offer", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "SendCounterOffer", "SendCounterOffer", 2m, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Fixed CREDIT fee to send a counter offer.", "Send Counter Offer", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "SubmitParticipationRequest", "SubmitParticipationRequest", 10m, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Fixed CREDIT fee to submit an opportunity participation request.", "Submit Participation Request", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "PublishOpportunity", "PublishOpportunity", 15m, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc), "Fixed CREDIT fee to publish an opportunity.", "Publish Opportunity", true, new DateTime(2026, 7, 9, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_WalletId_ActionCode_ReferenceType_ReferenceId",
                table: "WalletTransactions",
                columns: new[] { "WalletId", "ActionCode", "ReferenceType", "ReferenceId" },
                unique: true,
                filter: "[ActionCode] IS NOT NULL AND [ReferenceId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PricingRules_ActionCode",
                table: "PricingRules",
                column: "ActionCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PricingRules");

            migrationBuilder.DropIndex(
                name: "IX_WalletTransactions_WalletId_ActionCode_ReferenceType_ReferenceId",
                table: "WalletTransactions");

            migrationBuilder.DropColumn(
                name: "ActionCode",
                table: "WalletTransactions");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceType",
                table: "WalletTransactions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "None",
                oldClrType: typeof(string),
                oldType: "nvarchar(40)",
                oldMaxLength: 40,
                oldDefaultValue: "None");
        }
    }
}
