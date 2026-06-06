using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInvestmentImageAndParticipantStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "EquityOfferedPercentage",
                table: "Investments",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedInstallment",
                table: "Investments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ExpectedMonthlyReturn",
                table: "Investments",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GracePeriodMonths",
                table: "Investments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InterestRate",
                table: "Investments",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepaymentFrequency",
                table: "Investments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RevenueSharePercentage",
                table: "Investments",
                type: "decimal(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalRepaymentAmount",
                table: "Investments",
                type: "decimal(18,2)",
                nullable: true);

            // Convert existing string Status values to enum integer values before altering column type
            migrationBuilder.Sql(@"
                UPDATE InvestmentParticipants 
                SET Status = CASE 
                    WHEN Status = 'Confirmed' THEN 4
                    WHEN Status = 'Participated' THEN 4
                    WHEN Status = 'Approved' THEN 2
                    WHEN Status = 'InDiscussion' THEN 1
                    WHEN Status = 'Interested' THEN 0
                    WHEN Status = 'Rejected' THEN 5
                    WHEN Status = 'Inactive' THEN 6
                    ELSE 4
                END
            ");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "InvestmentParticipants",
                type: "int",
                nullable: false,
                defaultValue: 4,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldDefaultValue: "Confirmed");

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "InvestmentImages",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MediaType",
                table: "InvestmentImages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "InvestmentImages",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedBy",
                table: "InvestmentImages",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "InvestmentParticipants",
                keyColumn: "Id",
                keyValue: 5000,
                column: "Status",
                value: 4);

            migrationBuilder.UpdateData(
                table: "InvestmentParticipants",
                keyColumn: "Id",
                keyValue: 5001,
                column: "Status",
                value: 4);

            migrationBuilder.UpdateData(
                table: "InvestmentParticipants",
                keyColumn: "Id",
                keyValue: 5002,
                column: "Status",
                value: 4);

            migrationBuilder.UpdateData(
                table: "Investments",
                keyColumn: "Id",
                keyValue: 1000,
                columns: new[] { "EquityOfferedPercentage", "EstimatedInstallment", "ExpectedMonthlyReturn", "GracePeriodMonths", "InterestRate", "RepaymentFrequency", "RevenueSharePercentage", "TotalRepaymentAmount" },
                values: new object[] { null, null, null, null, null, null, null, null });

            migrationBuilder.UpdateData(
                table: "Investments",
                keyColumn: "Id",
                keyValue: 1001,
                columns: new[] { "EquityOfferedPercentage", "EstimatedInstallment", "ExpectedMonthlyReturn", "GracePeriodMonths", "InterestRate", "RepaymentFrequency", "RevenueSharePercentage", "TotalRepaymentAmount" },
                values: new object[] { null, null, null, null, null, null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_InvestmentImages_UploadedBy",
                table: "InvestmentImages",
                column: "UploadedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_InvestmentImages_AuthUsers_UploadedBy",
                table: "InvestmentImages",
                column: "UploadedBy",
                principalTable: "AuthUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvestmentImages_AuthUsers_UploadedBy",
                table: "InvestmentImages");

            migrationBuilder.DropIndex(
                name: "IX_InvestmentImages_UploadedBy",
                table: "InvestmentImages");

            migrationBuilder.DropColumn(
                name: "EquityOfferedPercentage",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "EstimatedInstallment",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "ExpectedMonthlyReturn",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "GracePeriodMonths",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "InterestRate",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "RepaymentFrequency",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "RevenueSharePercentage",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "TotalRepaymentAmount",
                table: "Investments");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "InvestmentImages");

            migrationBuilder.DropColumn(
                name: "MediaType",
                table: "InvestmentImages");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "InvestmentImages");

            migrationBuilder.DropColumn(
                name: "UploadedBy",
                table: "InvestmentImages");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "InvestmentParticipants",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Confirmed",
                oldClrType: typeof(int),
                oldType: "int",
                oldDefaultValue: 4);

            migrationBuilder.UpdateData(
                table: "InvestmentParticipants",
                keyColumn: "Id",
                keyValue: 5000,
                column: "Status",
                value: "Confirmed");

            migrationBuilder.UpdateData(
                table: "InvestmentParticipants",
                keyColumn: "Id",
                keyValue: 5001,
                column: "Status",
                value: "Confirmed");

            migrationBuilder.UpdateData(
                table: "InvestmentParticipants",
                keyColumn: "Id",
                keyValue: 5002,
                column: "Status",
                value: "Confirmed");
        }
    }
}
