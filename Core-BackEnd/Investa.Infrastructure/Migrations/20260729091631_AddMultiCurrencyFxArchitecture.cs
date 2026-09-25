using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiCurrencyFxArchitecture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PreferredCurrency",
                table: "UserProfiles",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "EGP");

            migrationBuilder.AddColumn<Guid>(
                name: "ExchangeRateSnapshotId",
                table: "Transactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ExchangeRateSnapshotId",
                table: "PaymentTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EnteredAmount",
                table: "OpportunityJoinRequests",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EnteredCurrency",
                table: "OpportunityJoinRequests",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExchangeRate",
                table: "OpportunityJoinRequests",
                type: "decimal(28,12)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExchangeRateProvider",
                table: "OpportunityJoinRequests",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ExchangeRateSnapshotId",
                table: "OpportunityJoinRequests",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExchangeRateTimestamp",
                table: "OpportunityJoinRequests",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FundingAmount",
                table: "OpportunityJoinRequests",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FundingCurrency",
                table: "OpportunityJoinRequests",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FundingCurrency",
                table: "Opportunities",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                defaultValue: "EGP");

            migrationBuilder.AddColumn<Guid>(
                name: "ExchangeRateSnapshotId",
                table: "WalletTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ExchangeRateSnapshotId",
                table: "FinanceTransactions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ExchangeRateSnapshots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TargetCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    ExchangeRate = table.Column<decimal>(type: "decimal(28,12)", nullable: false),
                    RateTimestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ProviderQuoteId = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsManualOverride = table.Column<bool>(type: "bit", nullable: false),
                    IsOfflineFallback = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeRateSnapshots", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_ExchangeRateSnapshotId",
                table: "Transactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_WalletTransactions_ExchangeRateSnapshotId",
                table: "WalletTransactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_ExchangeRateSnapshotId",
                table: "PaymentTransactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_ExchangeRateSnapshotId",
                table: "OpportunityJoinRequests",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.CreateIndex(
                name: "IX_FinanceTransactions_ExchangeRateSnapshotId",
                table: "FinanceTransactions",
                column: "ExchangeRateSnapshotId");

            migrationBuilder.AddForeignKey(
                name: "FK_FinanceTransactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "FinanceTransactions",
                column: "ExchangeRateSnapshotId",
                principalTable: "ExchangeRateSnapshots",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_OpportunityJoinRequests_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "OpportunityJoinRequests",
                column: "ExchangeRateSnapshotId",
                principalTable: "ExchangeRateSnapshots",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentTransactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "PaymentTransactions",
                column: "ExchangeRateSnapshotId",
                principalTable: "ExchangeRateSnapshots",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "Transactions",
                column: "ExchangeRateSnapshotId",
                principalTable: "ExchangeRateSnapshots",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_WalletTransactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "WalletTransactions",
                column: "ExchangeRateSnapshotId",
                principalTable: "ExchangeRateSnapshots",
                principalColumn: "Id");

            migrationBuilder.Sql("""
                UPDATE [Opportunities]
                SET [FundingCurrency] = COALESCE(NULLIF([Currency], ''), 'EGP');

                UPDATE [OpportunityJoinRequests]
                SET [EnteredAmount] = [RequestedAmount],
                    [FundingAmount] = [RequestedAmount],
                    [EnteredCurrency] = COALESCE(NULLIF(o.[Currency], ''), 'EGP'),
                    [FundingCurrency] = COALESCE(NULLIF(o.[Currency], ''), 'EGP'),
                    [ExchangeRate] = 1,
                    [ExchangeRateTimestamp] = [OpportunityJoinRequests].[CreatedAt],
                    [ExchangeRateProvider] = 'LegacyIdentity'
                FROM [OpportunityJoinRequests]
                INNER JOIN [Opportunities] o ON o.[Id] = [OpportunityJoinRequests].[OpportunityId];
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WalletTransactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "WalletTransactions");
            migrationBuilder.DropForeignKey(
                name: "FK_FinanceTransactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "FinanceTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_OpportunityJoinRequests_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_PaymentTransactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "PaymentTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_ExchangeRateSnapshot_ExchangeRateSnapshotId",
                table: "Transactions");

            migrationBuilder.DropTable(
                name: "ExchangeRateSnapshot");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_ExchangeRateSnapshotId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_WalletTransactions_ExchangeRateSnapshotId",
                table: "WalletTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_ExchangeRateSnapshotId",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityJoinRequests_ExchangeRateSnapshotId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_FinanceTransactions_ExchangeRateSnapshotId",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "PreferredCurrency",
                table: "UserProfiles");

            migrationBuilder.DropColumn(
                name: "ExchangeRateSnapshotId",
                table: "WalletTransactions");

            migrationBuilder.DropColumn(
                name: "ExchangeRateSnapshotId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "ExchangeRateSnapshotId",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "EnteredAmount",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "EnteredCurrency",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "ExchangeRate",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "ExchangeRateProvider",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "ExchangeRateSnapshotId",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "ExchangeRateTimestamp",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "FundingAmount",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "FundingCurrency",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "FundingCurrency",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ExchangeRateSnapshotId",
                table: "FinanceTransactions");
        }
    }
}
