using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Investa.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddInvestmentContractPdfMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PdfDocumentHash",
                table: "InvestmentContractVersions",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PdfDocumentSize",
                table: "InvestmentContractVersions",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PdfDocumentUrl",
                table: "InvestmentContractVersions",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PdfGeneratedAt",
                table: "InvestmentContractVersions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PdfGenerationError",
                table: "InvestmentContractVersions",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PdfGenerationStatus",
                table: "InvestmentContractVersions",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "NotGenerated");

            migrationBuilder.AddColumn<string>(
                name: "PdfMimeType",
                table: "InvestmentContractVersions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "application/pdf");

            migrationBuilder.AddColumn<string>(
                name: "PdfRendererVersion",
                table: "InvestmentContractVersions",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "playwright-chromium-v1");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "InvestmentContractVersions",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PdfDocumentHash",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "PdfDocumentSize",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "PdfDocumentUrl",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "PdfGeneratedAt",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "PdfGenerationError",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "PdfGenerationStatus",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "PdfMimeType",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "PdfRendererVersion",
                table: "InvestmentContractVersions");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "InvestmentContractVersions");
        }
    }
}
