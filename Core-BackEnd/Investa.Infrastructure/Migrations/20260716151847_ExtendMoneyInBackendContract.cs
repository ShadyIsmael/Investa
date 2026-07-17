using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ExtendMoneyInBackendContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NameAr",
                table: "IncomeCategories",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NameEn",
                table: "IncomeCategories",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IncomingMoneyType",
                table: "FinanceTransactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "NetAmountReceived",
                table: "FinanceTransactions",
                type: "decimal(18,2)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PaymentGatewayFee",
                table: "FinanceTransactions",
                type: "decimal(18,2)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "FinanceTransactions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceName",
                table: "FinanceTransactions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "IncomeCategories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "NameAr", "NameEn" },
                values: new object[] { null, "Other Operating Income" });

            migrationBuilder.Sql("""
                UPDATE [IncomeCategories]
                SET [NameEn] = COALESCE(NULLIF(LTRIM(RTRIM([NameEn])), ''), [Name])
                WHERE [NameEn] IS NULL OR LTRIM(RTRIM([NameEn])) = '';

                UPDATE [FinanceTransactions]
                SET
                    [IncomingMoneyType] = CASE
                        WHEN [TransactionType] = 5 THEN 5
                        WHEN [TransactionType] = 1 THEN 1
                        ELSE [IncomingMoneyType]
                    END,
                    [NetAmountReceived] = CASE
                        WHEN [TransactionType] IN (1, 5, 7) AND [NetAmountReceived] = 0 THEN [Amount]
                        ELSE [NetAmountReceived]
                    END
                WHERE [TransactionType] IN (1, 5, 7);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NameAr",
                table: "IncomeCategories");

            migrationBuilder.DropColumn(
                name: "NameEn",
                table: "IncomeCategories");

            migrationBuilder.DropColumn(
                name: "IncomingMoneyType",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "NetAmountReceived",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "PaymentGatewayFee",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "FinanceTransactions");

            migrationBuilder.DropColumn(
                name: "SourceName",
                table: "FinanceTransactions");
        }
    }
}
