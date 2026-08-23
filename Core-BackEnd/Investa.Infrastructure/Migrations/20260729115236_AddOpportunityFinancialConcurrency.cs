using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityFinancialConcurrency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PaymentAllocations_ParticipationRequestId_InstallmentNumber",
                table: "PaymentAllocations");

            migrationBuilder.AlterColumn<string>(
                name: "Reference",
                table: "PaymentTransactions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "PaymentTransactions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE [PaymentTransactions] SET [IdempotencyKey] = CONCAT('legacy-payment:', [Id]) WHERE [IdempotencyKey] IS NULL;");

            migrationBuilder.AlterColumn<string>(
                name: "IdempotencyKey",
                table: "PaymentTransactions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstallmentConfirmationKey",
                table: "PaymentAllocations",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "OpportunityJoinRequests",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Opportunities",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<int>(
                name: "ActiveRequestSlot",
                table: "OpportunityJoinRequests",
                type: "int",
                nullable: false,
                computedColumnSql: "CASE WHEN [Status] IN ('Pending', 'Approved') THEN 0 ELSE [Id] END",
                stored: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_IdempotencyKey",
                table: "PaymentTransactions",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_Reference",
                table: "PaymentTransactions",
                column: "Reference",
                unique: true,
                filter: "[Reference] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_InstallmentConfirmationKey",
                table: "PaymentAllocations",
                column: "InstallmentConfirmationKey",
                unique: true,
                filter: "[InstallmentConfirmationKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_PaymentTransactionId_ParticipationRequestId_InstallmentNumber",
                table: "PaymentAllocations",
                columns: new[] { "PaymentTransactionId", "ParticipationRequestId", "InstallmentNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_ActiveRequestSlot",
                table: "OpportunityJoinRequests",
                columns: new[] { "OpportunityId", "InvestorId", "ActiveRequestSlot" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_IdempotencyKey",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentTransactions_Reference",
                table: "PaymentTransactions");

            migrationBuilder.DropIndex(
                name: "IX_PaymentAllocations_InstallmentConfirmationKey",
                table: "PaymentAllocations");

            migrationBuilder.DropIndex(
                name: "IX_PaymentAllocations_PaymentTransactionId_ParticipationRequestId_InstallmentNumber",
                table: "PaymentAllocations");

            migrationBuilder.DropIndex(
                name: "IX_OpportunityJoinRequests_OpportunityId_InvestorId_ActiveRequestSlot",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "ActiveRequestSlot",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "PaymentTransactions");

            migrationBuilder.DropColumn(
                name: "InstallmentConfirmationKey",
                table: "PaymentAllocations");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "OpportunityJoinRequests");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Opportunities");

            migrationBuilder.AlterColumn<string>(
                name: "Reference",
                table: "PaymentTransactions",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentAllocations_ParticipationRequestId_InstallmentNumber",
                table: "PaymentAllocations",
                columns: new[] { "ParticipationRequestId", "InstallmentNumber" });
        }
    }
}
